const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true },
  token: { type: String, required: true },
  ipAddress: String,
  userAgent: String,
  status: { type: String, enum: ['active', 'expired', 'forced_logout'], default: 'active' },
  loginTime: { type: Date, default: Date.now },
  logoutTime: Date,
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }
}, { timestamps: true });

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Session', sessionSchema);