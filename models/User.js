const mongoose = require('mongoose');
module.exports = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 3 },
  password: { type: String, required: true, minlength: 4 },
  token:    { type: String, default: null },
  mapImage: { type: String, default: '' },
}));
