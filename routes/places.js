const router = require('express').Router();
const Place = require('../models/Place');

router.get('/', async (req, res) => {
  res.json(await Place.find({ user: req.user._id }).sort({ name: 1 }));
});

router.get('/image', (req, res) => res.json({ image: req.user.mapImage || '' }));

router.put('/image', async (req, res) => {
  req.user.mapImage = req.body.image;
  await req.user.save();
  res.json({ ok: true });
});

router.delete('/image', async (req, res) => {
  req.user.mapImage = '';
  await req.user.save();
  res.json({ ok: true });
});

router.post('/', async (req, res) => {
  const name = String(req.body.name || '').trim().toUpperCase();
  const place = (await Place.findOne({ user: req.user._id, name })) || new Place({ user: req.user._id, name });
  place.set({ x: req.body.x, y: req.body.y });
  res.status(201).json(await place.save());
});

router.delete('/:id', async (req, res) => {
  await Place.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ ok: true });
});

module.exports = router;
