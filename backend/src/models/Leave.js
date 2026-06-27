const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  userName: { type: String, required: true },
  employeeId: { type: String, required: true },
  userRole: { type: String, required: true },
  department: { type: String },
  
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  days: { type: Number, required: true },
  type: { type: String, required: true },
  reason: { type: String, required: true },
  
  halfDay: { type: Boolean, default: false },
  halfDayType: { type: String },
  
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  
  appliedOn: { type: Date, default: Date.now },
  approvedBy: [{ type: String }],
  approvedOn: { type: Date },
  comments: { type: String },
  
  pendingApprovals: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);