const mongoose = require('mongoose');
module.exports = mongoose.model('Place', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, uppercase: true },
  x:    { type: Number, required: true, min: 0, max: 100 },
  y:    { type: Number, required: true, min: 0, max: 100 },
}));
