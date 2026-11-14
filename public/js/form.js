const dlgForm = $('#dlg-form');
const field = dlgForm.elements;
let editingId = null;

$('#days').innerHTML = DAYS.map((d, i) => `<label class="chip"><input type="checkbox" value="${i}"><span>${d}</span></label>`).join('');

function toggleRepeat() {
  const once = field.repeat.value === 'once';
  $('#days').hidden = once;
  $('#date-wrap').hidden = !once;
}
field.repeat.onchange = toggleRepeat;

function openForm(s = null) {
  editingId = s ? s._id : null;
  $('#dlg-title').textContent = s ? 'Edit entry' : 'Add to timetable';
  $('#err').textContent = '';
  dlgForm.reset();
  if (s) {
    ['title', 'location', 'start', 'end', 'type', 'date', 'note'].forEach(k => field[k].value = s[k] || '');
    field.repeat.value = s.date ? 'once' : 'weekly';
    document.querySelectorAll('#days input').forEach(c => c.checked = s.days.includes(+c.value));
  } else {
    field.date.value = ymd(new Date());
  }
  toggleRepeat();
  $('#dlg').showModal();
}

$('#add').onclick = () => openForm();
$('#cancel').onclick = () => $('#dlg').close();

dlgForm.onsubmit = async e => {
  e.preventDefault();
  const once = field.repeat.value === 'once';
  const body = {
    title: field.title.value, location: field.location.value, type: field.type.value,
    start: field.start.value, end: field.end.value, note: field.note.value,
    days: once ? [] : [...document.querySelectorAll('#days input:checked')].map(c => +c.value),
    date: once ? field.date.value : '',
  };
  if (toMin(body.end) <= toMin(body.start)) { $('#err').textContent = 'End time must be after the start time'; return; }
  try {
    await api(editingId ? `${API}/${editingId}` : API, editingId ? 'PUT' : 'POST', body);
    $('#dlg').close();
    toast('Saved ✓');
    load();
  } catch (err) {
    $('#err').textContent = err.message;
  }
};

document.addEventListener('click', async e => {
  const b = e.target.closest('[data-edit],[data-del]');
  if (!b) return;
  if (b.dataset.edit) return openForm(slots.find(s => s._id === b.dataset.edit));
  if (confirm('Delete this entry?')) { await api(`${API}/${b.dataset.del}`, 'DELETE'); load(); }
});

$('#upload').onclick = () => $('#file').click();
$('#file').onchange = async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  const pad = (t = '') => t.replace(/^(\d):/, '0$1:');
  const dayNo = w => DAYS.findIndex(d => d.toLowerCase() === w.slice(0, 3).toLowerCase());
  const rows = (await file.text()).split(/\r?\n/).filter(r => r.trim()).map(r => r.split(',').map(c => c.trim()));
  if (rows[0]?.[0].toLowerCase() === 'title') rows.shift();
  if (!rows.length) return toast('That file has no rows');
  const data = rows.map(([title, location, type, days = '', start, end, date = '', note = '']) => ({
    title, location, type: (type || 'class').toLowerCase(), start: pad(start), end: pad(end), date, note,
    days: date ? [] : days.split(/[\s;|]+/).map(dayNo).filter(i => i >= 0),
  }));
  if (!confirm(`Replace your weekly timetable with ${data.length} entries from ${file.name}?`)) return;
  await api(`${API}/bulk?replace=1`, 'POST', data);
  toast('Timetable uploaded ✓');
  load();
};
