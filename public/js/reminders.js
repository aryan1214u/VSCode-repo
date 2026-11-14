const notified = new Set();

$('#lead').value = localStorage.getItem('lead') || '10';
$('#lead').onchange = () => localStorage.setItem('lead', $('#lead').value);

$('#bell').onclick = async () => {
  const answer = await Notification.requestPermission();
  toast(answer === 'granted' ? 'Alerts on 🔔 Keep this tab open' : 'Blocked. You will still see alerts inside the app');
  beep();
};

function remind() {
  const lead = +$('#lead').value;
  slotsOn(new Date()).forEach(s => {
    const mins = toMin(s.start) - nowMin();
    const key = s._id + ymd(new Date());
    if (mins < 0 || mins > lead || notified.has(key)) return;
    notified.add(key);
    const msg = `${s.title} at ${s.location} ${mins ? `in ${mins} min` : 'is starting now'}`;
    toast('⏰ ' + msg, 8000);
    beep();
    if (Notification.permission === 'granted') new Notification('Campus Connect', { body: msg });
  });
}
