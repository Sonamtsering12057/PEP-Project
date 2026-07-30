const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodPressureSystolic: {
    type: Number,
    required: true
  },
  bloodPressureDiastolic: {
    type: Number,
    required: true
  },
  heartRate: {
    type: Number,
    required: true
  },
  fastingGlucose: {
    type: Number,
    required: true
  },
  weightKg: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  recordedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Vital', vitalSchema);
