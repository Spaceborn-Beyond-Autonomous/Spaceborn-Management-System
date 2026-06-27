// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: String,  // Changed from ObjectId to String
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  employeeId: {
    type: String
  },
  date: {
    type: String,
    required: true
  },
  completedTasks: {
    type: String,
    default: ''
  },
  ongoingWork: {
    type: String,
    default: ''
  },
  issuesFaced: {
    type: String,
    default: ''
  },
  nextDayPlan: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed'],
    default: 'submitted'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
}, { timestamps: true });

// Indexes
reportSchema.index({ userId: 1, date: 1 }, { unique: true });
reportSchema.index({ department: 1, date: 1 });
reportSchema.index({ date: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);