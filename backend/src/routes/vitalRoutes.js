const express = require('express');
const router = express.Router();
const Vital = require('../models/Vital');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// POST /api/vitals - Log new vital reading
router.post('/', protect, restrictTo('Patient'), async (req, res) => {
  try {
    const { bloodPressureSystolic, bloodPressureDiastolic, heartRate, fastingGlucose, weightKg, notes } = req.body;

    const vital = await Vital.create({
      patient: req.user._id,
      bloodPressureSystolic: Number(bloodPressureSystolic),
      bloodPressureDiastolic: Number(bloodPressureDiastolic),
      heartRate: Number(heartRate),
      fastingGlucose: Number(fastingGlucose),
      weightKg: Number(weightKg),
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      data: vital,
      message: 'Vitals recorded successfully!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/vitals - Fetch patient's vital logs
router.get('/', protect, restrictTo('Patient'), async (req, res) => {
  try {
    const vitals = await Vital.find({ patient: req.user._id })
      .sort({ recordedAt: -1 })
      .limit(30);

    res.json({
      success: true,
      data: vitals
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/vitals/:id - Delete a vital log
router.delete('/:id', protect, restrictTo('Patient'), async (req, res) => {
  try {
    const vital = await Vital.findById(req.params.id);
    if (!vital) {
      return res.status(404).json({ success: false, message: 'Vital log not found' });
    }

    if (vital.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this log' });
    }

    await vital.deleteOne();
    res.json({ success: true, message: 'Vital entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
