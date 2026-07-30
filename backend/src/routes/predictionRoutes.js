const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// POST /api/predictions - Save a new ML scan result
router.post('/', protect, restrictTo('Patient'), async (req, res) => {
  try {
    const { diseaseType, inputs, predictionResult, riskScore, recommendations, specialistToConsult } = req.body;

    if (!diseaseType || !predictionResult) {
      return res.status(400).json({ success: false, message: 'diseaseType and predictionResult are required.' });
    }

    const newPrediction = await Prediction.create({
      patient: req.user._id,
      diseaseType,
      inputs: inputs || {},
      predictionResult,
      riskScore: riskScore || 0,
      recommendations: recommendations || 'Consult a medical specialist for clinical evaluation.',
      specialistToConsult: specialistToConsult || 'General Physician'
    });

    res.status(201).json({
      success: true,
      data: newPrediction,
      message: 'ML Scan result saved to history successfully!'
    });
  } catch (error) {
    console.error("Save Prediction Error:", error);
    res.status(500).json({ success: false, message: error.message || 'Failed to save prediction result.' });
  }
});

// GET /api/predictions/my-history - Get logged-in patient's prediction history
router.get('/my-history', protect, restrictTo('Patient'), async (req, res) => {
  try {
    const history = await Prediction.find({ patient: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
