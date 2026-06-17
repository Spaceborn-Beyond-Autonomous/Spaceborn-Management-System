const mongoose = require('mongoose');

const executiveDecisionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    due: { type: String, default: '' },
    department: { type: String, default: 'Executive' },
    impact: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'reviewing'], default: 'pending' },
    description: { type: String, default: '' },
    proposedBy: { type: String, default: '' },
    proposedAt: { type: Date, default: Date.now },
    impactAnalysis: { type: String, default: '' },
    approvedBy: { type: String, default: '' },
    approvedAt: { type: Date },
    rejectedBy: { type: String, default: '' },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, default: '' },
    comment: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExecutiveDecision', executiveDecisionSchema);
