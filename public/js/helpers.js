const API = '/api/slots';
let token = localStorage.getItem('token');
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const $ = sel => document.querySelector(sel);

const ymd = d => d.toLocaleDateString('en-CA');
const toMin = t => { const [h, m] = t.split(':'); return +h * 60 + +m; };
const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
const fmt = t => new Date(`2000-01-01T${t}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const hhmm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const dur = m => m < 60 ? `${m} min` : `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}`;
const esc = s => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

async function api(url = API, method = 'GET', body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-token': token || '' },
    body: body && JSON.stringify(body),
  });
  if (res.status === 401) { localStorage.removeItem('token'); location.reload(); }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

function toast(msg, ms = 3500) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  $('#toasts').append(t);
  setTimeout(() => t.remove(), ms);
}

function beep() {
  const ctx = new AudioContext(), osc = ctx.createOscillator();
  osc.frequency.value = 880;
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}
