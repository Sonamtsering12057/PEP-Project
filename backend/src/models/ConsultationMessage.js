const mongoose = require('mongoose');

const consultationMessageSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['Patient', 'Doctor'], required: true },
  message: { type: String, required: true }
}, { timestamps: true });

const ConsultationMessage = mongoose.model('ConsultationMessage', consultationMessageSchema);
module.exports = ConsultationMessage;
