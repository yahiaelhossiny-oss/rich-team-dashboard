import assets from './view.mjs';

const internal = new Set(['rich', 'templates']);
const offset = 4 * 3600_000;

export function monthOf(timestamp) {
  return new Date(Number(timestamp) + offset).toISOString().slice(0, 7);
}

function workType(tags, list) {
  const tag = (tags ?? []).map(value => value.name ?? value).find(value => /^work type\s*:/i.test(value));
  if (tag) return tag.replace(/^work type\s*:\s*/i, '').trim() || 'Unclassified';
  if (/performance.*crm/i.test(list)) return 'Performance & CRM';
  if (/social media|content calendar/i.test(list)) return 'Social media';
  if (/performance/i.test(list)) return 'Performance marketing';
  if (/\bcrm\b/i.test(list)) return 'CRM';
  if (/management/i.test(list)) return 'Account management';
  if (/episode production/i.test(list)) return 'Episode production';
  if (/campaign|project|creative brief/i.test(list)) return 'Campaigns & projects';
  return 'Unclassified';
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
      const entryType = workType(entry.tags, '');
      const type = entryType === 'Unclassified'
        ? workType(task?.tags ?? entry.task?.tags, task?.list?.name || location.list_name || '')
        : entryType;
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
  'Content-Security-Policy':"default-src 'self'; frame-ancestors 'none'; base-uri 'none'"};
function reply(body, status = 200, extra = {}) {
  return new Response(body, {status, headers: {...secure, ...extra}});
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
    if (!await authorized(request, env.DASHBOARD_PASSWORD)) {
      return reply('Sign in to the RICH dashboard.', 401, {'WWW-Authenticate':'Basic realm="RICH dashboard", charset="UTF-8"'});
    }
    const path = new URL(request.url).pathname;
    if (path === '/api/report' && request.method === 'GET') {
      const snapshot = await env.REPORTS.get('snapshot');
      return reply(snapshot || '{"pending":true}', 200, {'Content-Type':'application/json'});
    }
    if (path === '/api/refresh' && request.method === 'POST') {
      if (!env.REFRESH_KEY || request.headers.get('X-RICH-Refresh') !== env.REFRESH_KEY) return reply('Refresh header required.', 400);
      try {
        await sync(env);
        return reply('Refresh complete.');
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
