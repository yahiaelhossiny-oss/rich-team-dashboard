import assets from './view.mjs';
import { accountRoute, session } from './auth.mjs';
import { activityFor, activities } from './activity.mjs';

const internal = new Set(['rich', 'templates']);
const offset = 4 * 3600_000;

export function monthOf(timestamp) {
  return new Date(Number(timestamp) + offset).toISOString().slice(0, 7);
}

function bucket(map, keys, value) {
  const key = JSON.stringify(keys);
  map.set(key, (map.get(key) ?? 0) + value);
}

export async function sync(env, now = Date.now()) {
  const id = env.CLICKUP_WORKSPACE_ID;
  if (!/^\d+$/.test(id || '')) throw new Error('Set CLICKUP_WORKSPACE_ID');
  const roles = JSON.parse(env.ROLES_JSON || '{}');
  if (!env.CLICKUP_TOKEN) throw new Error('ClickUp credential is missing');
  async function api(path, query = {}) {
    const url = new URL('https://api.clickup.com/api/v2/' + path);
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetch(url, {headers: {Authorization: env.CLICKUP_TOKEN}});
      if (response.ok) return response.json();
      if (response.status !== 429 || attempt === 2) throw new Error('ClickUp ' + response.status + ' on ' + path);
      const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000 - Date.now();
      await new Promise(resolve => setTimeout(resolve, Math.max(1000, Math.min(65000, reset))));
    }
  }

  const {teams} = await api('team');
  const team = teams.find(item => String(item.id) === id);
  if (!team?.members?.length) throw new Error('ClickUp workspace member list is unavailable');
  const members = team.members.filter(item => item.user && Number(item.user.role ?? item.role) !== 4).map(({user}) => ({
    id: String(user.id), name: user.username || 'Member ' + user.id, role: roles[user.id] || null
  }));
  const {spaces} = await api('team/' + id + '/space', {archived: false});
  const clientNames = Object.fromEntries(spaces.map(space => [String(space.id), space.name]));
  const reportingClients = [...new Set(spaces.map(space => space.name).filter(name => !internal.has(name.toLowerCase())))].sort();
  const currentMonth = monthOf(now);
  const shifted = new Date(now + offset);
  const historyMonths = Number(env.REPORT_MONTHS || 12);
  if (!Number.isInteger(historyMonths) || historyMonths < 1 || historyMonths > 36) throw new Error('REPORT_MONTHS must be between 1 and 36');
  const months = Array.from({length: historyMonths}, (_, i) =>
    new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth() - i, 1)).toISOString().slice(0, 7));
  const startOf = month => Date.parse(month + '-01T00:00:00+04:00');
  const since = startOf(months.at(-1));
  const allocations = JSON.parse(env.CAPACITY_JSON || await env.REPORTS.get('capacity') || '[]');
  const allocationKeys = new Set();
  for (const item of allocations) {
    const key = JSON.stringify([item.month, item.client, String(item.memberId)]);
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(item.month) || !item.client ||
        !item.memberId || !Number.isFinite(item.hours) || item.hours < 0 || allocationKeys.has(key)) {
      throw new Error('Invalid or duplicate capacity allocation');
    }
    allocationKeys.add(key);
  }

  const taskIndex = new Map();
  for (let page = 0;; page++) {
    const result = await api('team/' + id + '/task', {
      page, order_by: 'id', include_closed: true, subtasks: true, date_created_gt: since - 1
    });
    if (!Array.isArray(result.tasks)) throw new Error('ClickUp task page is unavailable');
    for (const task of result.tasks) taskIndex.set(String(task.id), task);
    if (result.last_page === true || result.tasks.length < 100) break;
  }
  const adHoc = /^ad-hoc/i;
  const classifyClient = (space, tags) => {
    if (space && internal.has(space.toLowerCase())) return null;
    if (!space) return 'Unassigned client';
    if (!adHoc.test(space)) return space;
    const tagNames = (tags ?? []).map(tag => String(tag.name ?? tag).trim().toLowerCase());
    const matches = reportingClients.filter(name => !adHoc.test(name) &&
      (tagNames.includes(name.toLowerCase()) || tagNames.includes('client: ' + name.toLowerCase())));
    return matches.length === 1 ? matches[0] : space + ' · unassigned client';
  };
  const tasks = [];
  for (const task of taskIndex.values()) {
    const client = classifyClient(clientNames[task.space?.id], task.tags);
    if (client && Number.isFinite(Number(task.date_created))) tasks.push({id: String(task.id), name: task.name, client,
      status: task.status?.status || 'Unknown', created: Number(task.date_created)});
  }

  const byPerson = new Map();
  const byType = new Map();
  const seen = new Set();
  const assignee = members.map(member => member.id).join(',');
  for (const [index, month] of months.entries()) {
    const {data} = await api('team/' + id + '/time_entries', {
      start_date: startOf(month), end_date: index === 0 ? now : startOf(months[index - 1]) - 1,
      assignee, include_location_names: true, include_task_tags: true
    });
    if (!Array.isArray(data)) throw new Error('ClickUp time entries are unavailable');
    for (const entry of data) {
      const duration = Number(entry.duration);
      if (!Number.isFinite(duration) || duration <= 0 || seen.has(entry.id) || !Number.isFinite(Number(entry.start))) continue;
      seen.add(entry.id);
      const entryMonth = monthOf(entry.start);
      if (!months.includes(entryMonth)) continue;
      const task = taskIndex.get(String(entry.task?.id));
      const location = entry.task_location ?? {};
      const client = classifyClient(clientNames[task?.space?.id] || clientNames[location.space_id] || location.space_name, task?.tags ?? entry.task?.tags);
      if (!client) continue;
      if (!entry.user?.id) throw new Error('ClickUp time entry is missing a user');
      const person = String(entry.user.id);
      if (!members.some(member => member.id === person)) members.push({id: person, name: entry.user.username || 'Member ' + person, role: roles[person] || null});
      const type = activityFor(entry, task, task?.list?.name || location.list_name, roles[person]);
      bucket(byPerson, [entryMonth, client, person], duration);
      bucket(byType, [entryMonth, client, type, person], duration);
    }
  }
  const unpack = map => [...map].map(([key, duration]) => [...JSON.parse(key), duration]);
  const snapshot = {updated: now, currentMonth, months, members, clients: reportingClients, allocations, tasks, byPerson: unpack(byPerson), byType: unpack(byType)};
  await env.REPORTS.put('snapshot', JSON.stringify(snapshot));
  return snapshot;
}

const secure = {'Cache-Control':'private, no-store', 'X-Content-Type-Options':'nosniff',
  'Content-Security-Policy':"default-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"};
function reply(body, status = 200, extra = {}) {
  return new Response(body, {status, headers: {...secure, ...extra}});
}


const planPrefix = 'activity-plan:';
const planKey = (month, client) => planPrefix + month + ':' + encodeURIComponent(client);

async function activityPlans(env) {
  const rows = [];
  let cursor;
  do {
    const result = await env.REPORTS.list({prefix:planPrefix, cursor});
    for (const {metadata} of result.keys) {
      if (metadata) rows.push(metadata);
    }
    cursor = result.list_complete === false ? result.cursor : undefined;
  } while (cursor);
  return rows;
}
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
})[character]);

async function plannedHours(request, env, user) {
  if (!user?.admin) return reply('Only the administrator can set planned hours.', 403);
  const url = new URL(request.url);
  const post = request.method === 'POST';
  if (!post && request.method !== 'GET') return reply('Method not allowed.', 405);
  if (post && request.headers.get('Origin') !== url.origin) return reply('Invalid request origin.', 403);
  const report = await env.REPORTS.get('snapshot', 'json');
  if (!report) return reply('Sync ClickUp before setting planned hours.', 409);
  const clients = [...new Set([...report.clients, ...report.byPerson.map(row => row[1])])].sort();
  if (!clients.length) return reply('No clients are available.', 409);
  const fields = post ? await request.formData() : url.searchParams;
  const client = fields.get('client') || clients[0];
  const month = fields.get('month') || report.currentMonth;
  if (!clients.includes(client) || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return reply('Select a valid client and month.', 400);
  const key = planKey(month, client);
  if (post) {
    const hours = {};
    for (const activity of activities) {
      const value = fields.get(activity);
      if (value === null || value === '') continue;
      if (typeof value !== 'string' || !/^\d+(?:\.\d{1,2})?$/.test(value) || Number(value) > 100000) {
        return reply('Enter hours between 0 and 100,000 with up to two decimal places. Leave a field blank to clear its plan.', 400);
      }
      hours[activity] = Number(value);
    }
    const plan = {client, month, hours};
    if (Object.keys(hours).length) await env.REPORTS.put(key, JSON.stringify(plan), {metadata:plan});
    else await env.REPORTS.delete(key);
    return reply('', 303, {Location:'/planned-hours?' + new URLSearchParams({client, month, saved:'1'})});
  }
  const current = await env.REPORTS.get(key, 'json');
  const options = clients.map(name => '<option' + (name === client ? ' selected' : '') + '>' + escapeHtml(name) + '</option>').join('');
  const activityFields = activities.map(name => '<label>' + name + '<input type="number" min="0" max="100000" step="0.01" name="' + name +
    '" value="' + (current?.hours[name] ?? '') + '"></label>').join('');
  const notice = fields.has('saved') ? '<p role="status">Planned hours saved.</p>' : '';
  return reply(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Set planned hours | RICH</title><link rel="stylesheet" href="/style.css">
    <header><div class="brand"><img src="/rich-logo.svg" alt="RICH" width="75" height="30"><span aria-hidden="true">/</span> OPERATIONS</div></header>
    <main><h1>Set planned hours</h1><p><a href="/">Back to dashboard</a></p>
    <section><form method="get" class="filters"><label>Client<select name="client">${options}</select></label>
    <label>Month<input type="month" name="month" value="${month}" required></label><button>Load plan</button></form>
    ${notice}<h2>${escapeHtml(client)} · ${month}</h2>
    <p>Enter the client's total monthly hours budget for each activity. Leave an activity blank when no budget has been set.</p>
    <form method="post"><input type="hidden" name="client" value="${escapeHtml(client)}"><input type="hidden" name="month" value="${month}">
    <div class="plan-grid">${activityFields}</div><button>Save planned hours</button></form></section></main></html>`, 200, {'Content-Type':'text/html; charset=utf-8'});
}

async function authorized(request, password) {
  if (!password) return false;
  const encoder = new TextEncoder();
  const expected = 'Basic ' + btoa(String.fromCharCode(...encoder.encode('rich:' + password)));
  const hash = async value => new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
  const [left, right] = await Promise.all([hash(expected), hash(request.headers.get('Authorization') || '')]);
  return left.reduce((diff, value, i) => diff | (value ^ right[i]), 0) === 0;
}

export default {
  async fetch(request, env) {
    if (!env.DASHBOARD_PASSWORD) return reply('Dashboard access is being configured.', 503);
    const path = new URL(request.url).pathname;
    const user = await session(request, env);
    if (['/login','/logout','/account','/users'].includes(path)) return accountRoute(request, env, reply, user, path);
    if (!user && path === '/api/refresh' && !await authorized(request, env.DASHBOARD_PASSWORD)) return reply('Sign in to the RICH dashboard.', 401);
    if (!user && path.startsWith('/api/') && path !== '/api/refresh') return reply('Sign in to the RICH dashboard.', 401);
    if (!user && !['/api/refresh','/style.css','/rich-logo.svg'].includes(path)) return reply('', 303, {Location:'/login'});
    if (path === '/planned-hours') return plannedHours(request, env, user);
    if (path === '/api/report' && request.method === 'GET') {
      const snapshot = await env.REPORTS.get('snapshot');
      if (!snapshot) return reply('{"pending":true}', 200, {'Content-Type':'application/json'});
      const report = JSON.parse(snapshot);
      report.activityPlans = await activityPlans(env);
      report.canEditPlans = user.admin;
      return reply(JSON.stringify(report), 200, {'Content-Type':'application/json'});
    }
    if (path === '/api/refresh' && request.method === 'POST') {
      if (user && !user.admin) return reply('Only the administrator can refresh the report.', 403);
      if (user && request.headers.get('Origin') !== new URL(request.url).origin) return reply('Invalid request origin.', 403);
      if (!user && (!env.REFRESH_KEY || request.headers.get('X-RICH-Refresh') !== env.REFRESH_KEY)) return reply('Refresh header required.', 400);
      try {
        await sync(env);
        return user ? reply('', 303, {Location:'/'}) : reply('Refresh complete.');
      } catch (error) {
        console.error('Dashboard refresh failed', error.message);
        return reply('ClickUp refresh failed. The last successful report remains available.', 502);
      }
    }
    if (request.method !== 'GET') return reply('Method not allowed', 405);
    const asset = Object.hasOwn(assets, path) ? assets[path] : null;
    return asset ? reply(asset.body, 200, {'Content-Type': asset.type}) : reply('Not found', 404);
  },
  async scheduled(controller, env) {
    await sync(env, controller.scheduledTime);
  }
};
