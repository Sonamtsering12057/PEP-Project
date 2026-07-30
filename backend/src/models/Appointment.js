const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // e.g., '10:00-10:30'
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Rescheduled', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded'],
    default: 'Pending'
  },
  consultationFee: { type: Number, required: true },
  notes: { type: String }, // Doctor's notes after consultation
  prescription: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String }
}, { timestamps: true });

// Prevent double booking via unique compound index
appointmentSchema.index({ doctor: 1, date: 1, timeSlot: 1 }, { unique: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
