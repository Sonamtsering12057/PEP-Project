const express = require('express');
const router = express.Router();
const ConsultationMessage = require('../models/ConsultationMessage');
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/authMiddleware');

// POST /api/consultations/send - Send a consultation message
router.post('/send', protect, async (req, res) => {
  try {
    const { appointmentId, message } = req.body;

    if (!appointmentId || !message) {
      return res.status(400).json({ success: false, message: 'appointmentId and message are required.' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Verify user is either patient or doctor for this appointment
    const userId = req.user._id.toString();
    const isPatient = appointment.patient.toString() === userId;
    const isDoctor = appointment.doctor.toString() === userId;

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ success: false, message: 'Not authorized for this consultation chat.' });
    }

    const newMsg = await ConsultationMessage.create({
      appointment: appointmentId,
      sender: req.user._id,
      senderRole: req.user.role,
      message
    });

    const populated = await ConsultationMessage.findById(newMsg._id)
      .populate('sender', 'name email role');

    // Socket.io real-time emit
    const io = req.app.get('io');
    if (io) {
      io.to(`appointment_${appointmentId}`).emit('new_consultation_message', populated);
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("Consultation Send Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/consultations/appointment/:appointmentId - Fetch message history
router.get('/appointment/:appointmentId', protect, async (req, res) => {
  try {
    const messages = await ConsultationMessage.find({ appointment: req.params.appointmentId })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
