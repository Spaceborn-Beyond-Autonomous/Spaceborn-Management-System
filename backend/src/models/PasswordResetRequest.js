const mongoose = require('mongoose');

const passwordResetRequestSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  employeeName: {
    type: String,
    required: true
  },
  employeeEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  department: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: ''
  },
  reason: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedByName: {
    type: String,
    default: ''
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectedByName: {
    type: String,
    default: ''
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  comments: {
    type: String,
    default: ''
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  emailStatus: {
    type: String,
    enum: ['not_sent', 'sent', 'skipped', 'failed'],
    default: 'not_sent'
  },
  emailError: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

passwordResetRequestSchema.index({ employeeId: 1, status: 1 });
passwordResetRequestSchema.index({ status: 1, requestedAt: -1 });

module.exports = mongoose.model('PasswordResetRequest', passwordResetRequestSchema);
