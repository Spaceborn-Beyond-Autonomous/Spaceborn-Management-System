const mongoose = require('mongoose');

const hourBreakSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  userName: { type: String, required: true },
  employeeId: { type: String, required: true },
  userRole: { type: String, required: true },
  department: { type: String },
  
  date: { type: String, required: true },
  hours: { type: Number, required: true },
  reason: { type: String, required: true },
  
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  
  approvedBy: { type: String },
  approvedOn: { type: Date },
  rejectionReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('HourBreak', hourBreakSchema);