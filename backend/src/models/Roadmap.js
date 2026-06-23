const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    version: { type: String, default: '1.0' },
    description: { type: String, default: '' },
    department: { type: String, default: 'Core Systems' },
    startDate: { type: String, default: '' },
    targetDate: { type: String, default: '' },
    status: { type: String, default: 'draft' },
    sharedWith: [{ type: String }],
    sharedAt: { type: Date },
    sharedBy: {
      id: { type: String, default: '' },
      name: { type: String, default: '' },
      role: { type: String, default: '' },
      email: { type: String, default: '' },
      avatar: { type: String, default: '' }
    },
    overallProgress: { type: Number, default: 0 },
    milestones: { type: [mongoose.Schema.Types.Mixed], default: [] },
    features: { type: [mongoose.Schema.Types.Mixed], default: [] },
    risks: { type: [mongoose.Schema.Types.Mixed], default: [] },
    weeklyUpdates: { type: [mongoose.Schema.Types.Mixed], default: [] },
    attachments: { type: [mongoose.Schema.Types.Mixed], default: [] },
    blockers: { type: [String], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Roadmap', roadmapSchema);
