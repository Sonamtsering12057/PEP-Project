const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  diseaseType: {
    type: String,
    enum: ['Heart Disease', 'Diabetes', 'Thyroid', 'General Health Scan'],
    required: true
  },
  inputs: { type: Object, default: {} },
  predictionResult: { type: String, required: true }, // e.g., 'High Risk (82%)', 'Low Risk'
  riskScore: { type: Number, default: 0 }, // 0 to 100
  recommendations: { type: String },
  specialistToConsult: { type: String, default: 'General Physician' }
}, { timestamps: true });

const Prediction = mongoose.model('Prediction', predictionSchema);
module.exports = Prediction;
