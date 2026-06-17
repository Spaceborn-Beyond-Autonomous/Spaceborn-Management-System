const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  userName: { type: String },
  employeeId: { type: String },
  
  // Leave types and their balances
  Sick: { type: Number, default: 12 },
  Casual: { type: Number, default: 10 },
  Annual: { type: Number, default: 15 },
  Emergency: { type: Number, default: 5 },
  Other: { type: Number, default: 3 },
  
  year: { type: Number, default: new Date().getFullYear() }
}, { timestamps: true });

// Compound unique index for user + year
leaveBalanceSchema.index({ userId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);