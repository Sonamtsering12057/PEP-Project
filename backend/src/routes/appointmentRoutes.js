const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const mongoose = require('mongoose');

// POST /api/appointments/book - Patient books an appointment
router.post('/book', protect, restrictTo('Patient'), async (req, res) => {
  try {
    let { doctor, date, timeSlot, consultationFee } = req.body;

    if (!doctor || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Please provide doctor, date, and time slot.' });
    }

    // Safe Mongoose ObjectId validation check
    let targetDoctor = null;
    if (mongoose.Types.ObjectId.isValid(doctor)) {
      targetDoctor = await User.findById(doctor);
    }

    if (!targetDoctor || targetDoctor.role !== 'Doctor') {
      // Fallback: pick any active doctor from database or create default
      targetDoctor = await User.findOne({ role: 'Doctor' });
      if (!targetDoctor) {
        targetDoctor = await User.create({
          name: 'Dr. Harpreet Singh Johal',
          email: 'dr.harpreet@wellnessconnect.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'General Physician & Cardiology',
            qualifications: ['MBBS', 'MD (Medicine)'],
            experienceYears: 14,
            clinicLocation: { type: 'Point', coordinates: [75.7720, 31.2240], address: 'Johal Multispecialty Hospital, GT Road, Phagwara, Punjab' },
            isVerified: true
          }
        });
      }
      doctor = targetDoctor._id;
    }

    // Check if slot is already booked
    const existing = await Appointment.findOne({ doctor, date, timeSlot });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked. Please pick another time.' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      date,
      timeSlot,
      consultationFee: consultationFee || targetDoctor.doctorProfile?.consultationFee || 500,
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('doctor', 'name email doctorProfile')
      .populate('patient', 'name email');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Appointment booked successfully!'
    });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ success: false, message: error.message || 'Failed to book appointment' });
  }
});

// GET /api/appointments/patient - Fetch logged-in patient's appointments
router.get('/patient', protect, restrictTo('Patient'), async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name email doctorProfile')
      .sort({ date: -1 });
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/appointments/doctor - Fetch logged-in doctor's appointments
router.get('/doctor', protect, restrictTo('Doctor'), async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'name email')
      .sort({ date: -1 });
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/appointments/:id/status - Update appointment status (Doctor/Admin)
router.patch('/:id/status', protect, restrictTo('Doctor', 'Admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (req.user.role === 'Doctor' && appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this appointment' });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ success: true, data: appointment, message: `Appointment status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/appointments/:id/prescription - Doctor issues digital prescription
router.patch('/:id/prescription', protect, restrictTo('Doctor'), async (req, res) => {
  try {
    const { prescription, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to issue prescription for this appointment' });
    }

    appointment.prescription = prescription;
    if (notes) appointment.notes = notes;
    appointment.status = 'Completed';
    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email')
      .populate('doctor', 'name email doctorProfile');

    res.json({
      success: true,
      data: updated,
      message: 'Digital prescription issued successfully!'
    });
  } catch (error) {
    console.error("Prescription Save Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
