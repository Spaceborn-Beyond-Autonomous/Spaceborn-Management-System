const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    department: { type: String, default: 'Core Systems' },
    lead: { type: String, default: '' },
    dueDate: { type: String, default: '' },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    budget: { type: String, default: '' },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['pending', 'active', 'on-track', 'at-risk', 'delayed', 'completed'],
      default: 'pending'
    },
    tasks: {
      completed: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
