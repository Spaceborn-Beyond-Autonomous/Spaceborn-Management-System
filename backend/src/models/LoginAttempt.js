const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  ipAddress: String,
  attemptTime: {
    type: Date,
    default: Date.now
  },
  success: {
    type: Boolean,
    default: false
  },
  failureReason: String
}, { timestamps: true });

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);