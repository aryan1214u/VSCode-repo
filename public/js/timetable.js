let slots = [];
let view = 'today';

const slotsOn = d => slots
  .filter(s => s.days.includes(d.getDay()) || s.date === ymd(d))
  .sort((a, b) => a.start.localeCompare(b.start));

const state = s => nowMin() >= toMin(s.end) ? 'done' : nowMin() >= toMin(s.start) ? 'live' : 'next';

const card = (s, st = '') => `
  <article class="slot ${s.type} ${st}">
    <div class="time">${fmt(s.start)}<small>${fmt(s.end)}</small></div>
    <div class="info"><b>${esc(s.title)}</b><span>📍 ${esc(s.location)}${s.date ? ' · one-time' : ''}</span>
      ${s.note ? `<span class="note">📝 ${esc(s.note)}</span>` : ''}</div>
    <div class="btns">
      <button class="icon" data-edit="${s._id}" title="Edit">✎</button>
      <button class="icon" data-del="${s._id}" title="Delete">✕</button>
    </div>
  </article>`;

function renderHero(today) {
  const live = today.find(s => state(s) === 'live');
  const upcoming = today.filter(s => state(s) === 'next');
  const s = live || upcoming[0];
  if (!s) {
    $('#hero').innerHTML = `<p class="eyebrow">Today</p>
      <h2>${today.length ? "You're done for today 🎉" : 'Nothing scheduled'}</h2>
      <p class="muted">Use ＋ Add to put something on your day.</p>`;
    return;
  }
  const left = (live ? toMin(s.end) : toMin(s.start)) - nowMin();
  const after = upcoming.find(x => x !== s);
  $('#hero').innerHTML = `
    <p class="eyebrow">${live ? 'Happening now' : 'Up next'}</p>
    <h2>${esc(s.title)}</h2>
    <p class="where">📍 ${esc(s.location)}</p>
    <p class="muted">${fmt(s.start)} – ${fmt(s.end)} · ${live ? 'ends' : 'starts'} in <b>${dur(left)}</b></p>
    ${s.note ? `<p class="muted">📝 ${esc(s.note)}</p>` : ''}
    ${after ? `<p class="then">Then: ${esc(after.title)} @ ${esc(after.location)}, ${fmt(after.start)}</p>` : ''}`;
}

const DAY_START = 8 * 60, DAY_END = 20 * 60, MIN_GAP = 30;
function freeGaps(today) {
  const gaps = [];
  let cursor = Math.max(DAY_START, nowMin()), prev = null;
  for (const s of today) {
    if (toMin(s.start) - cursor >= MIN_GAP) gaps.push({ from: cursor, to: toMin(s.start), prev, next: s });
    if (toMin(s.end) > cursor) { cursor = toMin(s.end); prev = s; }
  }
  if (DAY_END - cursor >= MIN_GAP) gaps.push({ from: cursor, to: DAY_END, prev, next: null });
  return gaps;
}

const freeCard = g => `
  <article class="slot free">
    <div class="time">${fmt(hhmm(g.from))}<small>${fmt(hhmm(g.to))}</small></div>
    <div class="info"><b>${dur(g.to - g.from)} free${g.from === nowMin() ? ' · right now' : ''}</b>
      <span>${[g.prev && 'After ' + esc(g.prev.title), g.next ? `Next: ${esc(g.next.title)} @ ${esc(g.next.location)}` : 'Then the day is yours'].filter(Boolean).join(' · ')}</span>
    </div>
  </article>`;

function renderList(today) {
  if (view === 'free') {
    $('#list').innerHTML = freeGaps(today).map(freeCard).join('') || '<p class="empty">No free time left today 😅</p>';
    return;
  }
  if (view === 'today') {
    $('#list').innerHTML = today.map(s => card(s, state(s))).join('') || '<p class="empty">Nothing today. Add a class or a club meeting ✨</p>';
    return;
  }
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  $('#list').innerHTML = '<div class="week">' + [0, 1, 2, 3, 4, 5, 6].map(i => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const isToday = ymd(d) === ymd(new Date());
    return `<div class="day ${isToday ? 'today' : ''}"><h4>${DAYS[d.getDay()]} ${d.getDate()}</h4>
      ${slotsOn(d).map(s => card(s)).join('') || '<p class="empty">Free</p>'}</div>`;
  }).join('') + '</div>';
}

function render() {
  const today = slotsOn(new Date());
  $('#today-label').textContent = new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
  renderHero(today);
  renderList(today);
  renderMap(today);
}
