const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedToName: { type: String, default: '' },
    assignedToInitials: { type: String, default: '' },

    department: { type: String, default: 'Engineering' },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    dueDate: { type: String },
    estimatedHours: { type: Number, default: 0, min: 0 },

    progress: { type: Number, default: 0, min: 0, max: 100 },

    status: {
      type: String,
      enum: ['Pending', 'In progress', 'Completed', 'Overdue', 'Cancelled'],
      default: 'Pending',
    },

    // Compatibility with src/services/taskService.js log/comment features
    logs: [
      {
        taskName: { type: String, default: '' },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        notes: { type: String, default: '' },
        content: { type: String, default: '' },
        date: { type: String },
        hoursSpent: { type: Number, default: 0, min: 0 },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: String },
      }
    ],
    comments: [
      {
        comment: { type: String, default: '' },
        author: { type: String, default: 'Unknown' },
        authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: String },
      }
    ],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: String },
  },
  { timestamps: true }
);


module.exports = mongoose.model('Task', taskSchema);

