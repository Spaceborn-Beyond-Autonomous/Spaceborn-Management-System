const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD format
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: '1 hour'
  },
  meetingLink: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  createdBy: {
    type: String,
    required: true
  },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  attendees: [{
    type: String
  }],
  transcript: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    default: ''
  },
  transcriptSynced: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Indexes
meetingSchema.index({ date: 1, time: 1 });
meetingSchema.index({ department: 1, date: 1 });
meetingSchema.index({ createdById: 1 });

module.exports = mongoose.model('Meeting', meetingSchema);