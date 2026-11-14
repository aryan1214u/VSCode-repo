async function load() {
  [slots] = await Promise.all([api(), loadPlaces()]);
  render();
}

document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => {
  view = b.dataset.view;
  document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b));
  render();
});

(async () => {
  if (!token) return showApp(false);
  showApp(true);
  $('#who').textContent = '👤 ' + (localStorage.getItem('username') || '');
  await load();
  remind();
  setInterval(() => load().finally(remind), 30000);
})();
