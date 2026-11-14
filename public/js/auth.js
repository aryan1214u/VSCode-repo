function showApp(loggedIn) {
  $('#app').hidden = !loggedIn;
  $('#login').hidden = loggedIn;
}

async function authenticate(kind) {
  const f = $('#auth-form').elements;
  try {
    const r = await api(`/api/auth/${kind}`, 'POST', { username: f.username.value, password: f.password.value });
    localStorage.setItem('token', r.token);
    localStorage.setItem('username', r.username);
    location.reload();
  } catch (err) {
    $('#auth-err').textContent = err.message;
  }
}

$('#auth-form').onsubmit = e => { e.preventDefault(); authenticate('login'); };
$('#register').onclick = () => authenticate('register');

$('#logout').onclick = async () => {
  await api('/api/auth/logout', 'POST').catch(() => {});
  localStorage.removeItem('token');
  location.reload();
};
