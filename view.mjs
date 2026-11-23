export default {
  "/rich-logo.svg": {type: "image/svg+xml; charset=utf-8", body: String.raw`<?xml version="1.0" encoding="UTF-8"?>
<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 500 200.3">
  <!-- Generator: Adobe Illustrator 30.4.0, SVG Export Plug-In . SVG Version: 2.1.4 Build 226)  -->
  <defs>
    <style>
      .st0 {
        fill: #0a83be;
      }
    </style>
  </defs>
  <path class="st0" d="M135.84,65.59l-.04.04c0-40.33-33.42-53.95-56.41-53.95H5.44l13.07,37.98v134.13h51.89v-65.13l20.95,65.13,50.53.16-25.59-75.8c8.64-5.49,19.55-17.92,19.55-42.56M74.55,84.74h-4.16v-24.96l4.32.16c11.95.52,10.91,24.96-.16,24.8"/>
  <rect class="st0" x="144.24" y="11.68" width="51.89" height="172.27"/>
  <path class="st0" d="M284.72,62.41h16.79l-.36-50.89h-25.95c-47.93,0-70.4,34.47-70.4,86.24s22.51,86.23,70.4,86.23h25.95l.36-50.89h-16.95c-20.23,0-27.86-14.47-27.86-35.35s8.47-35.35,28.02-35.35"/>
  <polygon class="st0" points="426.56 11.68 374.67 11.68 374.67 72.05 362.04 72.05 362.04 11.68 310.15 11.68 310.15 183.95 362.04 183.95 362.04 123.78 374.67 123.78 374.67 183.95 413.77 183.95 426.56 183.95 439.36 183.95 426.56 145.81 426.56 11.68"/>
  <polygon class="st0" points="478.31 145.93 439.05 145.93 452 183.95 491.22 183.95 478.31 145.93"/>
</svg>`},
  "/": {type: "text/html; charset=utf-8", body: String.raw`
<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RICH | Client delivery</title>
<link rel="stylesheet" href="/style.css">
<script type="module" src="/report.js"></script>
<header><div class="brand"><img src="/rich-logo.svg" alt="RICH" width="75" height="30"><span aria-hidden="true">/</span> OPERATIONS</div><div id="sync">Loading ClickUp report…</div></header>
<main>
<h1>Client delivery</h1>
<div class="filters">
<label>Month <select id="month"></select></label>
<label>Client <select id="client"></select></label>
<label>Team member <select id="member"></select></label>
</div>
<p id="notice" role="status"></p>
<div class="metrics" id="metrics"></div>
<nav aria-label="Report sections">
<button aria-pressed="true" data-view="capacity">Team capacity</button>
<button aria-pressed="false" data-view="work">Client work mix</button>
<button aria-pressed="false" data-view="tasks">Tasks &amp; statuses</button>
</nav>
<section id="report" aria-live="polite"></section>
</main>
</html>
`},
  "/style.css": {type: "text/css; charset=utf-8", body: String.raw`
:root{font-family:system-ui,sans-serif;color:#14221d;background:#edf2ed}
*{box-sizing:border-box}body{margin:0}header{background:#15382c;color:#fff;display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:1.2rem max(5vw,1rem)}.brand{display:flex;align-items:center;gap:.55rem;font-weight:850;letter-spacing:.1em}.brand img{display:block;filter:brightness(0) invert(1);object-fit:contain}.brand span{color:#bdec85}#sync{font-size:.85rem}main{max-width:1350px;margin:auto;padding:2.3rem max(4vw,1rem)}h1{font-size:clamp(2.5rem,6vw,4.8rem);margin:0 0 1.3rem;letter-spacing:-.07em}h2{letter-spacing:-.035em}.filters,.metrics,nav{display:flex;gap:.8rem;flex-wrap:wrap}.filters label{display:grid;gap:.3rem;font-weight:650;font-size:.8rem;flex:1 1 175px;max-width:320px}select,input,button{font:inherit;padding:.65rem .8rem;border:1px solid #91a497;border-radius:.5rem;background:white;color:inherit}button{cursor:pointer;font-weight:650}button[aria-pressed=true]{background:#15382c;color:white;border-color:#15382c}.metrics{margin:1.3rem 0}.metric{background:#dbead7;border-radius:.8rem;padding:1rem;flex:1 1 160px}.metric strong{display:block;font-size:1.8rem;letter-spacing:-.04em}section{margin:1rem 0;background:white;padding:1rem 1.2rem;border-radius:.8rem}.scroll{overflow:auto}table{width:100%;border-collapse:collapse;text-align:left}th,td{padding:.7rem .6rem;border-bottom:1px solid #e1e9e1;vertical-align:top}th{font-size:.76rem;text-transform:uppercase;letter-spacing:.045em;color:#41594c}a{color:#215b44}p{color:#40574b}.status{display:inline-block;background:#ecf3e8;padding:.2rem .5rem;border-radius:.4rem}.table-filters{display:flex;flex-wrap:wrap;gap:.65rem;margin-bottom:1rem}.table-filters label{display:grid;gap:.3rem}button:focus-visible,select:focus-visible,input:focus-visible,a:focus-visible{outline:3px solid #257454;outline-offset:2px}
`},
  "/report.js": {type: "text/javascript; charset=utf-8", body: String.raw`
const $ = id => document.getElementById(id);
const hours = value => new Intl.NumberFormat('en', {maximumFractionDigits: 1}).format(value) + ' h';
const dubai = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Dubai', dateStyle:'medium', timeStyle:'short'});
const day = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Dubai', dateStyle:'medium'});
const monthOf = stamp => new Date(stamp + 14400000).toISOString().slice(0, 7);
const positiveHours = duration => duration / 3600000;
let data;
let view = 'capacity';

function el(tag, value, className) {
  const node = document.createElement(tag);
  if (value instanceof Node) node.append(value);
  else if (value !== undefined) node.textContent = value;
  if (className) node.className = className;
  return node;
}

function options(select, pairs) {
  select.replaceChildren(...pairs.map(([value, label]) => new Option(label, value)));
}

function table(headers, rows) {
  if (!rows.length) return el('p', 'No records for these filters.');
  const result = el('table');
  const header = result.createTHead().insertRow();
  for (const title of headers) {
    const cell = el('th', title);
    cell.scope = 'col';
    header.append(cell);
  }
  const body = result.createTBody();
  for (const row of rows) for (const [i, value] of row.entries()) {
    const current = i === 0 ? body.insertRow() : body.rows[body.rows.length - 1];
    current.insertCell().append(value);
  }
  return el('div', result, 'scroll');
}

function grouped(rows, keyOf) {
  const counts = new Map();
  for (const row of rows) {
    const key = keyOf(row);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts];
}

function taskView(target, tasks) {
  const totals = grouped(tasks, task => task.client).sort(([a], [b]) => a.localeCompare(b));
  if ($('client').value) {
    if (!totals.length) totals.push([$('client').value, 0]);
  } else {
    for (const client of data.clients) if (!totals.some(([name]) => name === client)) totals.push([client, 0]);
    totals.sort(([a], [b]) => a.localeCompare(b));
  }
  target.append(el('h2', 'Tasks created by client'), table(['Client', 'Created', 'Current statuses'], totals.map(([client, count]) => [
    client, String(count), grouped(tasks.filter(task => task.client === client), task => task.status).map(([status, n]) => status + ' · ' + n).join('  /  ') || '—'
  ])));
  const status = el('select');
  const search = el('input');
  search.type = 'search';
  options(status, [['', 'All statuses'], ...[...new Set(tasks.map(task => task.status))].sort().map(value => [value, value])]);
  const controls = el('div', undefined, 'table-filters');
  const statusLabel = el('label', 'Status');
  const searchLabel = el('label', 'Find a task');
  statusLabel.append(status);
  searchLabel.append(search);
  controls.append(statusLabel, searchLabel);
  const details = el('div');
  let page = 1;
  function show(reset) {
    if (reset) page = 1;
    const query = search.value.trim().toLowerCase();
    const rows = tasks.filter(task => (!status.value || task.status === status.value) && task.name.toLowerCase().includes(query));
    const pageCount = Math.max(1, Math.ceil(rows.length / 50));
    const list = table(['Task', 'Client', 'Status', 'Created'], rows.slice((page - 1) * 50, page * 50).map(task => {
      const link = el('a', task.name);
      link.href = 'https://app.clickup.com/t/' + encodeURIComponent(task.id);
      return [link, task.client, el('span', task.status, 'status'), day.format(task.created)];
    }));
    details.replaceChildren(list);
    if (pageCount > 1) {
      const previous = el('button', 'Previous');
      const next = el('button', 'Next');
      previous.disabled = page === 1;
      next.disabled = page === pageCount;
      previous.onclick = () => {page--; show(false);};
      next.onclick = () => {page++; show(false);};
      const buttons = el('div', undefined, 'table-filters');
      buttons.append(previous, el('p', 'Page ' + page + ' of ' + pageCount), next);
      details.append(buttons);
    }
  }
  status.onchange = search.oninput = () => show(true);
  tasks.sort((a,b) => b.created - a.created);
  show(false);
  target.append(el('h2', 'Task details'), controls, details);
}

function render() {
  const month = $('month').value;
  const client = $('client').value;
  const member = $('member').value;
  const scoped = row => row[0] === month && (!client || row[1] === client);
  const logs = data.byPerson.filter(row => scoped(row) && (!member || row[2] === member));
  const work = data.byType.filter(row => scoped(row) && (!member || row[4] === member));
  const tasks = data.tasks.filter(task => (!client || task.client === client) && monthOf(task.created) === month);
  const allocations = data.allocations.filter(item => item.month === month && (!client || item.client === client) && (!member || String(item.memberId) === member));
  const pairs = new Map(logs.map(([, client, person, time]) => [JSON.stringify([person, client]), {person, client, time}]));
  for (const entry of allocations) {
    const person = String(entry.memberId);
    const key = JSON.stringify([person, entry.client]);
    pairs.set(key, {...(pairs.get(key) || {person, client:entry.client, time:0}), planned:entry.hours});
  }
  for (const person of data.members) {
    if ((!member || person.id === member) && ![...pairs.values()].some(row => row.person === person.id)) {
      pairs.set(person.id, {person:person.id, client:client || '—', time:0});
    }
  }

  const total = logs.reduce((sum, row) => sum + row[3], 0);
  const planned = allocations.reduce((sum, item) => sum + item.hours, 0);
  $('metrics').replaceChildren(...[
    ['Logged hours', hours(positiveHours(total))],
    ['Recorded planned hours', allocations.length ? hours(planned) : 'Unset'],
    ['Tasks created', String(tasks.length)],
  ].map(([label, value]) => {
    const tile = el('div', undefined, 'metric');
    tile.append(el('strong', value), el('span', label));
    return tile;
  }));
  const target = $('report');
  target.replaceChildren();
  const names = new Map(data.members.map(person => [person.id, person]));
  if (view === 'capacity') {
    const rows = [...pairs.values()].sort((a,b) => (names.get(a.person)?.name || '').localeCompare(names.get(b.person)?.name || '') || a.client.localeCompare(b.client));
    target.append(el('h2', 'Monthly capacity by team member and client'),
      table(['Team member', 'Role', 'Client', 'Planned', 'Logged', 'Logged ÷ planned'], rows.map(row => {
        const person = names.get(row.person);
        const logged = positiveHours(row.time);
        return [person?.name || row.person, person?.role || 'Role needed', row.client, row.planned === undefined ? 'Unset' : hours(row.planned),
          hours(logged), row.planned > 0 ? Math.round(100 * logged / row.planned) + '%' : '—'];
      })));
  }
  if (view === 'work') {
    const groupedWork = new Map();
    for (const [, name, type, duration] of work) {
      const key = JSON.stringify([name, type]);
      groupedWork.set(key, (groupedWork.get(key) || 0) + duration);
    }
    const totals = new Map();
    for (const [key, duration] of groupedWork) {
      const [name] = JSON.parse(key);
      totals.set(name, (totals.get(name) || 0) + duration);
    }
    const rows = [...groupedWork].map(([key, duration]) => [...JSON.parse(key), duration])
      .sort((a,b) => a[0].localeCompare(b[0]) || b[2] - a[2]);
    target.append(el('h2', 'Logged work by client'),
      el('p', 'Work type comes from an explicit work type tag or the ClickUp task list.'),
      table(['Client', 'Work type', 'Logged', 'Share of client hours'], rows.map(([name,type,time]) => [name,type,hours(positiveHours(time)),Math.round(100 * time / totals.get(name)) + '%'])));
  }
  if (view === 'tasks') taskView(target, tasks);
  $('notice').textContent = view === 'tasks' && member ? 'Task counts and statuses include all team members.' : '';
}

async function start() {
  const response = await fetch('/api/report');
  if (!response.ok) throw new Error('ClickUp report unavailable');
  data = await response.json();
  if (data.pending) {
    $('sync').textContent = 'Waiting for first ClickUp sync';
    $('notice').textContent = 'The dashboard will show client and team data after the first successful refresh.';
    return;
  }
  $('sync').textContent = 'Last synced ' + dubai.format(data.updated) + ' Dubai · Daily at 5:00 AM';
  options($('month'), data.months.map(value => [value, new Intl.DateTimeFormat('en', {month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(value + '-01T00:00:00Z'))]));
  const clients = [...new Set([...data.clients, ...data.tasks.map(task => task.client), ...data.byPerson.map(row => row[1]), ...data.allocations.map(item => item.client)])].sort();
  options($('client'), [['', 'All clients'], ...clients.map(name => [name,name])]);
  options($('member'), [['', 'All team members'], ...data.members.map(person => [person.id,person.name]).sort((a,b) => a[1].localeCompare(b[1]))]);
  for (const id of ['month','client','member']) $(id).onchange = render;
  for (const button of document.querySelectorAll('[data-view]')) button.onclick = () => {
    for (const other of document.querySelectorAll('[data-view]')) other.setAttribute('aria-pressed', String(other === button));
    view = button.dataset.view;
    render();
  };
  render();
}
start().catch(() => {$('sync').textContent = 'Report unavailable'; $('notice').textContent = 'Reload the page to try again.';});
`},
};
