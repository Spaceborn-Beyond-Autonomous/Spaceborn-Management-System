const mongoose = require('mongoose');

const resourceRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    requesterName: {
      type: String,
      required: true
    },

    requesterRole: {
      type: String,
      enum: ['CEO', 'Manager', 'TeamLead', 'Member'],
      required: true
    },

    department: {
      type: String,
      default: ''
    },

    resourceName: {
      type: String,
      required: true,
      trim: true
    },

    resourceType: {
      type: String,
      required: true,
      trim: true
    },

    quantity: {
      type: Number,
      default: 1
    },

    reason: {
      type: String,
      required: true
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },

    approvalLevel: {
      type: String,
       enum: ['TeamLead', 'Manager', 'CEO'],
      required: true
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    approvedByName: {
      type: String,
      default: null
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
      default: null
    },

    rejectedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  'ResourceRequest',
  resourceRequestSchema
);