const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String },
  isRecurring: { type: Boolean, default: false },
  declaredBy: { type: String }
}, { timestamps: true });

// Index for fast date lookups
holidaySchema.index({ date: 1 });

module.exports = mongoose.model('Holiday', holidaySchema);