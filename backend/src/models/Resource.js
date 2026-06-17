const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: [
        'Hardware',
        'Software',
        'Cloud',
        'License',
        'Facility',
        'Other'
      ],
      required: true
    },

    total: {
      type: Number,
      default: 0
    },

    allocated: {
      type: Number,
      default: 0
    },

    available: {
      type: Number,
      default: 0
    },

    cost: {
      type: String,
      default: ''
    },

    department: {
      type: String,
      default: 'All'
    },

    status: {
      type: String,
      enum: [
        'Available',
        'Limited',
        'Fully Used'
      ],
      default: 'Available'
    },

    allocatedTo: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  'Resource',
  resourceSchema
);