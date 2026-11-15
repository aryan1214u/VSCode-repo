const router = require('express').Router();
const Slot = require('../models/Slot');

router.get('/', async (req, res) => {
  res.json(await Slot.find({ user: req.user._id }).sort({ start: 1 }));
});

router.post('/', async (req, res) => {
  res.status(201).json(await Slot.create({ ...req.body, user: req.user._id }));
});

router.post('/bulk', async (req, res) => {
  const fresh = await Slot.insertMany(req.body.map(row => ({ ...row, user: req.user._id })));
  if (req.query.replace)
    await Slot.deleteMany({ user: req.user._id, date: '', _id: { $nin: fresh.map(s => s._id) } });
  res.status(201).json(fresh);
});

router.put('/:id', async (req, res) => {
  const slot = await Slot.findOne({ _id: req.params.id, user: req.user._id });
  if (!slot) return res.status(404).json({ error: 'Entry not found' });
  slot.set({ ...req.body, user: req.user._id });
  res.json(await slot.save());
});

router.delete('/:id', async (req, res) => {
  await Slot.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ ok: true });
});

module.exports = router;
