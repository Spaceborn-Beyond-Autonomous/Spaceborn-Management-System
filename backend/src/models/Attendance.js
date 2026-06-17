// models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: String,  // Store as string like Reports
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  employeeId: {
    type: String
  },
  department: {
    type: String,
    required: true
  },
  role: {
    type: String
  },
  date: {
    type: String,  // YYYY-MM-DD
    required: true
  },
  checkIn: {
    type: String,
    default: ''
  },
  checkInTime: {
    type: Date
  },
  checkOut: {
    type: String,
    default: ''
  },
  checkOutTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'on-leave', 'working-from-home', 'not-marked'],
    default: 'not-marked'
  },
  hoursWorked: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  isAutoMarked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Indexes
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ department: 1, date: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);