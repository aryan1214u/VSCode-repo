const router = require('express').Router();
const { randomUUID } = require('crypto');
const User = require('../models/User');
const requireLogin = require('../middleware/auth');

async function giveToken(user) {
  user.token = randomUUID();
  await user.save();
  return { token: user.token, username: user.username };
}

router.post('/register', async (req, res) => {
  if (await User.findOne({ username: req.body.username?.toLowerCase().trim() }))
    throw new Error('That username is already taken');
  res.status(201).json(await giveToken(new User({ username: req.body.username, password: req.body.password })));
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username?.toLowerCase().trim() });
  if (!user || user.password !== req.body.password) throw new Error('Wrong username or password');
  res.json(await giveToken(user));
});

router.post('/logout', requireLogin, async (req, res) => {
  req.user.token = null;
  await req.user.save();
  res.json({ ok: true });
});

module.exports = router;
