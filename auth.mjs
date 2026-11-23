const encoder = new TextEncoder();
const cookieName = '__Host-rich_session';
const lifetime = 8 * 60 * 60;
const usernameOk = name => /^[a-z0-9][a-z0-9._-]{2,39}$/.test(name);
const passwordOk = password => password.length >= 12 && password.length <= 128;
const accountKey = name => 'account:' + name;
const encode = bytes => btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
const decode = value => Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), char => char.charCodeAt(0));
const random = () => encode(crypto.getRandomValues(new Uint8Array(16)));
const escape = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);
const passwordField = (name, label, autocomplete, minimum = 0) => '<label>' + label + '<input type="password" name="' + name + '" autocomplete="' + autocomplete + '" maxlength="128"' + (minimum ? ' minlength="' + minimum + '"' : '') + ' required></label>';
const usernameField = '<label>Username<input name="username" autocomplete="username" maxlength="40" required></label>';

function equal(left, right) {
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  if (a.length !== b.length) return false;
  return a.reduce((diff, value, i) => diff | (value ^ b[i]), 0) === 0;
}

async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({name:'PBKDF2', salt:decode(salt), iterations:100000, hash:'SHA-256'}, key, 256);
  return encode(new Uint8Array(bits));
}

async function accountFor(password) {
  const salt = random();
  return {salt, hash:await passwordHash(password, salt), version:random()};
}

async function signature(env, text) {
  const key = await crypto.subtle.importKey('raw', encoder.encode('rich-session:' + env.DASHBOARD_PASSWORD), {name:'HMAC', hash:'SHA-256'}, false, ['sign']);
  return encode(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(text))));
}

async function sessionCookie(env, user) {
  const body = [user.name, user.version, Math.floor(Date.now() / 1000) + lifetime].join(':');
  return cookieName + '=' + body + '.' + await signature(env, body) +
    '; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=' + lifetime;
}

export async function session(request, env) {
  const cookie = (request.headers.get('Cookie') || '').split(';').map(item => item.trim()).find(item => item.startsWith(cookieName + '='));
  if (!cookie) return null;
  const value = cookie.slice(cookieName.length + 1);
  const delimiter = value.lastIndexOf('.');
  const body = value.slice(0, delimiter);
  const [name, version, expiry] = body.split(':');
  if (delimiter < 0 || !usernameOk(name || '') || !version || !(Number(expiry) > Date.now() / 1000) ||
      !equal(value.slice(delimiter + 1), await signature(env, body))) return null;
  if (name === 'rich') return version === 'admin' ? {name, version, admin:true} : null;
  const account = await env.REPORTS.get(accountKey(name), 'json');
  return account?.version === version ? {name, version, admin:false, client:account.client ?? null} : null;
}

function redirect(reply, location, cookie) {
  const headers = {Location:location};
  if (cookie) headers['Set-Cookie'] = cookie;
  return reply('', 303, headers);
}

function page(reply, title, content, status = 200) {
  return reply(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} | RICH</title><link rel="stylesheet" href="/style.css"><header><div class="brand"><img src="/rich-logo.svg" alt="RICH" width="75" height="30"><span aria-hidden="true">/</span> OPERATIONS</div></header><main><h1>${title}</h1><section class="account-panel">${content}</section></main></html>`, status, {'Content-Type':'text/html; charset=utf-8'});
}

function loginPage(reply, error = '') {
  return page(reply, 'Sign in', `${error ? '<p role="alert">' + error + '</p>' : ''}<form method="post" action="/login">${usernameField}${passwordField('password','Password','current-password')}<button>Sign in</button></form>`, error ? 401 : 200);
}

function accountPage(reply, user, error = '') {
  const notice = error ? '<p role="alert">' + error + '</p>' : '';
  const link = '<p><a href="/">Back to dashboard</a></p>';
  if (user.admin) return page(reply, 'Account', link + '<p><a href="/users">Manage users</a></p><p><a href="/planned-hours">Set planned hours</a></p><form method="post" action="/api/refresh"><button>Sync ClickUp now</button></form><p>The administrator password is managed in Cloudflare.</p>');
  return page(reply, 'Change password', link + notice + `<form method="post" action="/account">${passwordField('current','Current password','current-password')}${passwordField('password','New password','new-password')}${passwordField('confirm','Confirm new password','new-password')}<p>Use at least 12 characters.</p><button>Change password</button></form>`, error ? 400 : 200);
}

async function availableClients(env) {
  const report = await env.REPORTS.get('snapshot', 'json');
  return (report?.clients ?? []).filter(name => !/^ad-hoc|^unassigned client/i.test(name)).sort();
}

async function usersPage(reply, env, error = '', username = '') {
  const {keys} = await env.REPORTS.list({prefix:'account:', limit:100});
  const list = keys.map(key => '<li>' + escape(key.name.slice('account:'.length)) +
    (key.metadata?.client ? ' · Client: ' + escape(key.metadata.client) : ' · Internal') + '</li>').join('');
  const clients = await availableClients(env);
  const choices = clients.map(client => '<option value="' + escape(client) + '">Client: ' + escape(client) + '</option>').join('');
  return page(reply, 'Manage users', '<p><a href="/">Back to dashboard</a></p>' +
    (error ? '<p role="alert">' + error + '</p>' : '') +
    `<form method="post" action="/users"><label>Username<input name="username" autocomplete="off" minlength="3" maxlength="40" pattern="[A-Za-z0-9][A-Za-z0-9._\\-]{2,39}" value="${escape(username)}" aria-describedby="username-hint" required></label><p id="username-hint">Use 3–40 letters, numbers, dots, underscores or hyphens. Start with a letter or number.</p>${passwordField('password','Temporary password','new-password',12)}<p>Use at least 12 characters for the temporary password.</p><label>Dashboard access<select name="client" required><option value="" disabled selected>Select access</option><option value="internal">Internal dashboard</option>${choices}</select></label><button>Add user</button></form><h2>Users</h2>` +
    (list ? '<ul>' + list + '</ul>' : '<p>No additional users.</p>'), error ? 400 : 200);
}

export async function accountRoute(request, env, reply, user, path) {
  const post = request.method === 'POST';
  if (!post && request.method !== 'GET') return reply('Method not allowed', 405);
  if (post && request.headers.get('Origin') !== new URL(request.url).origin) return reply('Invalid request origin', 403);
  if (path === '/login') {
    if (!post) return user ? redirect(reply, '/') : loginPage(reply);
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!(await env.LOGIN_LIMIT.limit({key:ip})).success) return reply('Too many attempts. Try again in a minute.', 429);
    const form = await request.formData();
    const name = String(form.get('username') || '').trim().toLowerCase();
    const password = String(form.get('password') || '');
    if (!usernameOk(name) || !password || password.length > 128) return loginPage(reply, 'Username or password is incorrect.');
    if (name === 'rich' && equal(password, env.DASHBOARD_PASSWORD)) {
      return redirect(reply, '/', await sessionCookie(env, {name, version:'admin'}));
    }
    const account = name === 'rich' ? null : await env.REPORTS.get(accountKey(name), 'json');
    if (!account || !equal(await passwordHash(password, account.salt), account.hash)) return loginPage(reply, 'Username or password is incorrect.');
    return redirect(reply, '/', await sessionCookie(env, {name, version:account.version}));
  }
  if (!user) return redirect(reply, '/login');
  if (path === '/logout' && post) return redirect(reply, '/login', cookieName + '=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0');
  if (path === '/users') {
    if (!user.admin) return reply('Only the administrator can manage users', 403);
    if (!post) return usersPage(reply, env);
    const form = await request.formData();
    const name = String(form.get('username') || '').trim().toLowerCase();
    const password = String(form.get('password') || '');
    if (!usernameOk(name)) return usersPage(reply, env, 'The username must start with a letter or number and contain only letters, numbers, dots, underscores or hyphens.', name);
    if (name === 'rich' || await env.REPORTS.get(accountKey(name))) return usersPage(reply, env, 'That username already exists.', name);
    if (!passwordOk(password)) return usersPage(reply, env, 'The temporary password must contain 12–128 characters.', name);
    const access = String(form.get('client') || '');
    if (!access) return usersPage(reply, env, 'Select dashboard access.', name);
    const client = access === 'internal' ? '' : access;
    if (client && !(await availableClients(env)).includes(client)) return usersPage(reply, env, 'Select an available client.', name);
    const account = await accountFor(password);
    if (client) account.client = client;
    await env.REPORTS.put(accountKey(name), JSON.stringify(account), client ? {metadata:{client}} : undefined);
    return redirect(reply, '/users');
  }
  if (path === '/account') {
    if (!post) return accountPage(reply, user);
    if (user.admin) return reply('Change the administrator password in Cloudflare', 403);
    const form = await request.formData();
    const password = String(form.get('password') || '');
    const current = String(form.get('current') || '');
    if (!passwordOk(password) || password !== form.get('confirm')) return accountPage(reply, user, 'Enter a matching new password of at least 12 characters.');
    const account = await env.REPORTS.get(accountKey(user.name), 'json');
    if (!account || current.length > 128 || !equal(await passwordHash(current, account.salt), account.hash)) return accountPage(reply, user, 'The current password is incorrect.');
    const updated = await accountFor(password);
    if (account.client) updated.client = account.client;
    await env.REPORTS.put(accountKey(user.name), JSON.stringify(updated), updated.client ? {metadata:{client:updated.client}} : undefined);
    return redirect(reply, '/', await sessionCookie(env, {...user, version:updated.version}));
  }
  return reply('Method not allowed', 405);
}
