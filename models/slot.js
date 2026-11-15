const mongoose = require('mongoose');
const slotSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:    { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  type:     { type: String, enum: ['class', 'club', 'other'], default: 'class' },
  start:    { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  end:      { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  note:     { type: String, default: '', trim: true, maxlength: 200 },
  days:     { type: [Number], default: [] },
  date:     { type: String, default: '' },
}, { timestamps: true });

slotSchema.pre('validate', function () {
  if (!this.days.length && !this.date) throw new Error('Pick at least one weekday, or a date for a one-time entry');
});

module.exports = mongoose.model('Slot', slotSchema);
