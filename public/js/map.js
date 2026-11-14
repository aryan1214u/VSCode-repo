let places = {};
let placeList = [];
let placing = false;
let picked = null;

async function loadPlaces() {
  const [list, photo] = await Promise.all([api('/api/places'), api('/api/places/image')]);
  placeList = list;
  showMapPhoto(photo.image);
  places = Object.fromEntries(placeList.map(p => [p.name, [p.x, p.y]]));
}

const squash = t => t.toUpperCase().replace(/\s+/g, '');
function spot(place) {
  const text = squash(place);
  const name = Object.keys(places).filter(n => text.startsWith(squash(n))).sort((a, b) => b.length - a.length)[0];
  return name && places[name];
}

function renderMap(today) {
  const remaining = today.filter(s => state(s) !== 'done');
  const stops = remaining.map(s => ({ s, p: spot(s.location) })).filter(x => x.p);
  $('#route').setAttribute('points', stops.map(x => x.p.join(',')).join(' '));
  $('#pins').innerHTML = stops.map((x, i) => `
    <div class="pin ${i === 0 ? 'hot' : ''}" style="left:${x.p[0]}%;top:${x.p[1]}%">
      <i></i><span>${esc(x.s.location)}</span>
    </div>`).join('')
    + (placing ? placeList.map(p => `
    <div class="pin spot" style="left:${p.x}%;top:${p.y}%"><i></i><span>${esc(p.name)}</span></div>`).join('') : '');

  $('#place-list').innerHTML = placeList.map(p =>
    `<span class="place">${esc(p.name)}<button class="icon" data-delplace="${p._id}" title="Remove">✕</button></span>`).join('');

  $('#map-note').textContent = placing ? 'Click on the map where the place is.'
    : remaining.length && !stops.length ? 'No pins yet. Click "Add place" and mark your buildings on the map.'
    : '';
}

$('#add-place').onclick = () => {
  placing = !placing;
  $('#map').classList.toggle('placing', placing);
  $('#add-place').textContent = placing ? '✔ Done' : '📍 Add place';
  render();
};

$('#map').onclick = e => {
  if (!placing) return;
  const r = e.currentTarget.getBoundingClientRect();
  const pct = (v, size) => Math.round(v / size * 1000) / 10;
  picked = { x: pct(e.clientX - r.left, r.width), y: pct(e.clientY - r.top, r.height) };
  const unplaced = [...new Set(slots.map(s => s.location))].filter(l => !spot(l));
  $('#unplaced').innerHTML = unplaced.map(l => `<option value="${esc(l)}">`).join('');
  $('#place-form').reset();
  $('#place-err').textContent = '';
  $('#place-dlg').showModal();
};

$('#place-cancel').onclick = () => $('#place-dlg').close();

$('#place-form').onsubmit = async e => {
  e.preventDefault();
  try {
    await api('/api/places', 'POST', { name: $('#place-form').elements.place.value, ...picked });
    $('#place-dlg').close();
    toast('Place saved 📍');
    load();
  } catch (err) {
    $('#place-err').textContent = err.message;
  }
};

document.addEventListener('click', async e => {
  const b = e.target.closest('[data-delplace]');
  if (!b) return;
  await api('/api/places/' + b.dataset.delplace, 'DELETE');
  load();
});

let shownPhoto = null;
function showMapPhoto(data) {
  if (data === shownPhoto) return;
  shownPhoto = data;
  const map = $('#map');
  if (!data) { map.style.removeProperty('--photo'); map.style.aspectRatio = ''; return; }
  const img = new Image();
  img.onload = () => {
    map.style.setProperty('--photo', `url("${data}")`);
    map.style.aspectRatio = img.width + ' / ' + img.height;
  };
  img.src = data;
}

function shrink(file) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.src = URL.createObjectURL(file);
  });
}

$('#map-photo').onclick = () => {
  if (shownPhoto && !confirm('Replace the map photo? Your saved pins keep their old positions.')) return;
  $('#map-file').click();
};
$('#map-file').onchange = async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  await api('/api/places/image', 'PUT', { image: await shrink(file) });
  toast('Map photo saved 🖼. Now click 📍 Add place and pin your buildings.');
  load();
};
