export default {
  "/rich-logo.svg": {type: "image/svg+xml; charset=utf-8", body: String.raw`<?xml version="1.0" encoding="UTF-8"?>
<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 500 200.3">
  <!-- Generator: Adobe Illustrator 30.4.0, SVG Export Plug-In . SVG Version: 2.1.4 Build 226)  -->
  <defs>
    <style>
      .st0 {
        fill: #0085c2;
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
<header><div class="brand"><img src="/rich-logo.svg" alt="RICH" width="75" height="30"><span aria-hidden="true">/</span> OPERATIONS</div><div class="header-tools"><div id="sync">Loading ClickUp report…</div><a href="/account">Account</a><form action="/logout" method="post"><button>Sign out</button></form></div></header>
<main>
<h1>Client delivery</h1>
<div class="filters">
<label>From month <select id="month"></select></label>
<label>To month <select id="through"></select></label>
<label>Client <select id="client"></select></label>
<label>Team member <select id="member"></select></label>
</div>
<p id="notice" role="status"></p>
<div class="metrics" id="metrics"></div>
<nav aria-label="Report sections">
<button aria-pressed="true" data-view="capacity">Team capacity</button>
<button aria-pressed="false" data-view="work">Client activity</button>
<button aria-pressed="false" data-view="tasks">Tasks &amp; statuses</button>
</nav>
<section id="report" aria-live="polite"></section>
<section id="client-export" aria-label="Client PDF export"></section>
<section id="print-report"></section>
</main>
</html>
`},
  "/style.css": {type: "text/css; charset=utf-8", body: String.raw`
:root{font-family:system-ui,sans-serif;color:#00162e;background:#ebe9e6}
*{box-sizing:border-box}body{margin:0}header{background:#00162e;color:#fff;display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:1.2rem max(5vw,1rem)}.brand{display:flex;align-items:center;gap:.55rem;font-weight:850;letter-spacing:.1em}.header-tools{display:flex;align-items:center;justify-content:flex-end;gap:.85rem;flex-wrap:wrap}.header-tools a{color:white}.header-tools button{padding:.3rem .65rem;background:#fff;color:#00162e;border-color:#e1ecfd}.header-tools button:hover{background:#e1ecfd}.export-options{border:0;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:.75rem 1.5rem}.export-options legend{font-weight:650;margin-bottom:.3rem}button:disabled{opacity:.55;cursor:default}.account-panel{max-width:35rem}.account-panel form,.account-panel label{display:grid;gap:.45rem}.account-panel form{gap:.8rem}.account-panel button{justify-self:start}.brand img{display:block;filter:brightness(0) invert(1);object-fit:contain}.brand span{color:#ff6b61}#sync{font-size:.85rem}main{max-width:1350px;margin:auto;padding:2.3rem max(4vw,1rem)}h1{font-size:clamp(2.5rem,6vw,4.8rem);margin:0 0 1.3rem;letter-spacing:-.07em}h2{letter-spacing:-.035em}.filters,.metrics,nav{display:flex;gap:.8rem;flex-wrap:wrap}.filters label{display:grid;gap:.3rem;font-weight:650;font-size:.8rem;flex:1 1 175px;max-width:320px}select,input,button{font:inherit;padding:.65rem .8rem;border:1px solid #005371;border-radius:.5rem;background:white;color:inherit}button{cursor:pointer;font-weight:650}button[aria-pressed=true]{background:#00162e;color:white;border-color:#00162e}.metrics{margin:1.3rem 0}.metric{background:#e1ecfd;border-radius:.8rem;padding:1rem;flex:1 1 160px}.metric strong{display:block;font-size:1.8rem;letter-spacing:-.04em}section{margin:1rem 0;background:white;padding:1rem 1.2rem;border-radius:.8rem}.scroll{overflow:auto}table{width:100%;border-collapse:collapse;text-align:left}th,td{padding:.7rem .6rem;border-bottom:1px solid #e1ecfd;vertical-align:top}th{font-size:.76rem;text-transform:uppercase;letter-spacing:.045em;color:#005371}a{color:#005371}p{color:#005371}.status{display:inline-block;background:#e1ecfd;padding:.2rem .5rem;border-radius:.4rem}.table-filters{display:flex;flex-wrap:wrap;gap:.65rem;margin-bottom:1rem}.table-filters label{display:grid;gap:.3rem}button:focus-visible,select:focus-visible,input:focus-visible,a:focus-visible{outline:3px solid #0085c2;outline-offset:2px}.activity-client{border-top:1px solid #e1ecfd;margin-top:1.5rem;padding-top:.5rem}.activity-client h3{margin-bottom:.25rem}.activity-client p{margin-top:.25rem}.plan-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin:1rem 0}.plan-grid label{display:grid;gap:.4rem}.filters button{align-self:end}#print-report{display:none}#client-export label{display:flex;align-items:center;gap:.4rem}
@media print{@page{margin:16mm}body{background:white;color:#00162e}header,main>*{display:none!important}main{padding:0;max-width:none}main>#print-report{display:block!important;margin:0;padding:0}#print-report h1{font-size:32pt;margin:8mm 0 2mm}#print-report h2{margin-top:7mm}#print-report .pdf-brand{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #005371;padding-bottom:3mm}#print-report .scroll{overflow:visible}#print-report tr{break-inside:avoid}#print-report h2{break-after:avoid}#print-report th,#print-report td{padding:2.5mm}}
`},
  "/report.js": {type: "text/javascript; charset=utf-8", body: String.raw`
const $ = id => document.getElementById(id);
const hours = value => new Intl.NumberFormat('en', {maximumFractionDigits: 1}).format(value) + ' h';
const dubai = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Dubai', dateStyle:'medium', timeStyle:'short'});
const day = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Dubai', dateStyle:'medium'});
const monthLabel = value => new Intl.DateTimeFormat('en', {month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(value + '-01T00:00:00Z'));
const sharedDesign = 'Design and motion (shared)';
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

function activityReport(target, work, plans, month, client, member) {
  const totals = new Map();
  for (const [, name, type, , duration] of work) {
    if (!totals.has(name)) totals.set(name, new Map());
    const activities = totals.get(name);
    activities.set(type, (activities.get(type) || 0) + duration);
  }
  const clients = client ? [client] : [...new Set([...totals.keys(), ...(!member ? plans.keys() : [])])].sort();
  target.append(el('h2', 'Client activity report'),
    el('p', 'Activities use ClickUp work-type tags, task titles, team roles and task lists. Unclassified hours are included in the totals.'));
  target.append(el('p', 'Planned hours are retainer budgets. Logged hours can include fixed-price ad-hoc work, pitches and internal support. A logged hour does not imply a charge to the client.'));
  if (member) target.append(el('p', 'Clear the team member filter to compare with the client’s full activity plan.'));
  if (data.canEditPlans) {
    const link = el('a', 'Set planned hours');
    link.href = '/planned-hours?' + new URLSearchParams({month, ...(client ? {client} : {})});
    target.append(el('p', link));
  }
  if (!clients.length) target.append(el('p', 'No logged hours or activity plans for these filters.'));
  for (const name of clients) {
    const logged = totals.get(name) || new Map();
    const plan = member ? {} : plans.get(name) || {};
    const allTypes = [...new Set([...logged.keys(), ...Object.keys(plan)])].sort((a,b) => (logged.get(b) || 0) - (logged.get(a) || 0) || a.localeCompare(b));
    const total = [...logged.values()].reduce((sum, duration) => sum + duration, 0);
    const planned = Object.values(plan).reduce((sum, value) => sum + value, 0);
    const block = el('div', undefined, 'activity-client');
    block.append(el('h3', name), el('p', hours(positiveHours(total)) + ' logged' +
      (Object.keys(plan).length ? ' · ' + hours(planned) + ' planned' : '')));
    const columns = member ? ['Activity', 'Logged', 'Share of logged hours'] : ['Activity', 'Logged', 'Retainer plan', 'Share of logged hours'];
    const rows = allTypes.map(type => {
      const duration = logged.get(type) || 0;
      const share = total ? Math.round(100 * duration / total) + '%' : '—';
      return member ? [type, hours(positiveHours(duration)), share] :
        [type, hours(positiveHours(duration)), Object.hasOwn(plan,type) ? hours(plan[type]) : 'Unset', share];
    });
    block.append(table(columns, rows));
    target.append(block);
  }
}

function exportTaskStage(task) {
  const label = String(task.status || '').toLowerCase().replace(/[_-]/g,' ').trim();
  const type = String(task.statusType || '').toLowerCase();
  if (/cancel|archive|reject|duplicate|won.t do/.test(label)) return '';
  if (['closed','done'].includes(type) || /^(closed|complete|completed|done|delivered|finished|published)$/.test(label)) return 'completed';
  if (/^(not started|to do|todo|open|new|backlog|assigned|planned|ready|awaiting start|queued)(\b|$)/.test(label)) return '';
  if (type === 'custom' || /progress|ongoing|working|active|review|approval|blocked|revisions|feedback|production/.test(label)) return 'progress';
  return '';
}

function exportControl(client, from, through, plans, work, tasks) {
  const controls = $('client-export');
  controls.replaceChildren();
  controls.append(el('h2','Client PDF'));
  if (!client) {
    controls.append(el('p','Select one client to prepare a PDF.'));
    return;
  }

  const print = el('button','Export client PDF');
  print.disabled = true;
  const choices = [['timesheet','Timesheet'],['completed','Completed tasks'],['progress','Tasks in progress']];
  const selected = new Set();
  const options = el('fieldset',undefined,'export-options');
  options.append(el('legend','Sections to include'));
  for (const [id,title] of choices) {
    const input = el('input');
    input.type = 'checkbox';
    const label = el('label');
    label.append(input,' ' + title);
    input.onchange = () => {
      if (input.checked) selected.add(id);
      else selected.delete(id);
      print.disabled = selected.size === 0;
    };
    options.append(label);
  }
  controls.append(options,el('p','Review the selected tasks and logged hours before sharing the PDF.'),print);
  print.onclick = () => {
    if (!selected.size) return;
    const target = $('print-report');
    const header = el('div',undefined,'pdf-brand');
    const logo = el('img');
    logo.src = '/rich-logo.svg';
    logo.alt = 'RICH';
    logo.width = 84;
    header.append(logo,el('p','Client delivery report'));
    target.replaceChildren(header,el('h1',client),
      el('p',from === through ? monthLabel(from) : monthLabel(from) + ' – ' + monthLabel(through)));

    if (selected.has('timesheet')) {
      const totals = new Map();
      for (const [, , activity, , duration] of work) totals.set(activity, (totals.get(activity) || 0) + duration);
      const plan = plans.get(client) || {};
      const types = [...new Set([...Object.keys(plan), ...totals.keys()])].sort();
      const rows = types.map(type => [type,hours(positiveHours(totals.get(type) || 0)),
        Object.hasOwn(plan,type) ? hours(plan[type]) : '—']);
      const total = [...totals.values()].reduce((sum, time) => sum + time,0);
      target.append(el('h2','Timesheet'),el('p',hours(positiveHours(total)) + ' logged in the selected period.'),
        table(['Activity','Logged','Retainer plan'], rows),
        el('p','Logged time is a delivery measure and does not represent charges.'));
    }
    for (const [id,title] of choices.slice(1)) {
      if (!selected.has(id)) continue;
      const matching = tasks.filter(task => exportTaskStage(task) === id).sort((a,b) => b.created - a.created);
      target.append(el('h2',title),el('p',matching.length + ' tasks created in this period with this current status.'),
        table(['Task','Current status','Created'],matching.map(task => [task.name,task.status,day.format(task.created)])));
    }
    window.print();
  };
}

function render() {
  const month = $('month').value;
  const through = $('through').value;
  const inRange = value => value >= month && value <= through;
  const client = $('client').value;
  const previousMember = $('member').value;
  const scoped = row => inRange(row[0]) && (!client || row[1] === client);
  const scopedLogs = data.byPerson.filter(scoped);
  const loggedMembers = new Set(scopedLogs.map(row => row[2]));
  const visibleMembers = data.members.filter(person => !client || loggedMembers.has(person.id));
  options($('member'), [['', 'All team members'], ...visibleMembers.map(person => [person.id,person.name]).sort((a,b) => a[1].localeCompare(b[1]))]);
  $('member').value = visibleMembers.some(person => person.id === previousMember) ? previousMember : '';
  const member = $('member').value;
  const logs = scopedLogs.filter(row => !member || row[2] === member);
  const planRows = (data.activityPlans || []).filter(plan => inRange(plan.month) && (!client || plan.client === client));
  const monthPlans = new Map(planRows.map(plan => [JSON.stringify([plan.month,plan.client]), plan.hours]));
  const plans = new Map();
  for (const plan of planRows) {
    const accumulated = plans.get(plan.client) || {};
    for (const [activity, value] of Object.entries(plan.hours)) accumulated[activity] = (accumulated[activity] || 0) + value;
    plans.set(plan.client, accumulated);
  }
  const clientWork = data.byType.filter(scoped).map(row => {
    const monthPlan = monthPlans.get(JSON.stringify(row.slice(0,2)));
    return monthPlan && Object.hasOwn(monthPlan,sharedDesign) && ['Design','Motion design and animation'].includes(row[2])
      ? [row[0],row[1],sharedDesign,row[3],row[4]] : row;
  });
  const work = clientWork.filter(row => !member || row[3] === member);
  const tasks = data.tasks.filter(task => (!client || task.client === client) && inRange(monthOf(task.created)));
  const allocations = data.allocations.filter(item => inRange(item.month) && (!client || item.client === client) && (!member || String(item.memberId) === member));
  const pairs = new Map();
  for (const [, name, person, time] of logs) {
    const key = JSON.stringify([person, name]);
    const row = pairs.get(key) || {person, client:name, time:0};
    row.time += time;
    pairs.set(key, row);
  }
  for (const entry of allocations) {
    const person = String(entry.memberId);
    const key = JSON.stringify([person, entry.client]);
    if (!client || pairs.has(key)) pairs.set(key, {...(pairs.get(key) || {person, client:entry.client, time:0}), planned:(pairs.get(key)?.planned || 0) + entry.hours});
  }
  for (const person of client ? [] : data.members) {
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
    target.append(el('h2', 'Capacity by team member and client'),
      table(['Team member', 'Role', 'Client', 'Planned', 'Logged', 'Logged ÷ planned'], rows.map(row => {
        const person = names.get(row.person);
        const logged = positiveHours(row.time);
        return [person?.name || row.person, person?.role || 'Role needed', row.client, row.planned === undefined ? 'Unset' : hours(row.planned),
          hours(logged), row.planned > 0 ? Math.round(100 * logged / row.planned) + '%' : '—'];
      })));
  }
  if (view === 'work') activityReport(target, work, plans, month, client, member);
  if (view === 'tasks') taskView(target, tasks);
  exportControl(client, month, through, plans, clientWork, tasks);
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
  const monthOptions = data.months.map(value => [value,monthLabel(value)]);
  options($('month'), monthOptions);
  options($('through'), monthOptions);
  $('month').onchange = () => {
    if ($('through').value < $('month').value) $('through').value = $('month').value;
    render();
  };
  $('through').onchange = () => {
    if ($('through').value < $('month').value) $('month').value = $('through').value;
    render();
  };
  const clients = [...new Set([...data.clients, ...data.tasks.map(task => task.client), ...data.byPerson.map(row => row[1]), ...data.allocations.map(item => item.client)])].sort();
  options($('client'), [['', 'All clients'], ...clients.map(name => [name,name])]);
  for (const id of ['client','member']) $(id).onchange = render;
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
