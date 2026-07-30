const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Message = require('../models/Message');

// GET /api/admin/metrics
router.get('/metrics', protect, restrictTo('Admin'), async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'Patient' });
    const totalDoctors = await User.countDocuments({ role: 'Doctor' });
    const pendingAppointments = await Appointment.countDocuments({ status: 'Pending' });
    const totalMessages = await Message.countDocuments();

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        pendingAppointments,
        totalMessages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
