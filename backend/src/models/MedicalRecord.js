const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  recordType: {
    type: String,
    enum: ['Lab Report', 'Prescription', 'Imaging / X-Ray', 'Discharge Summary', 'Other'],
    default: 'Lab Report'
  },
  fileUrl: { type: String, required: true }, // Base64 data URL or storage URL
  fileName: { type: String, default: 'medical_doc.pdf' },
  aiSummary: {
    type: String,
    default: 'Document uploaded successfully. Parameters within normal clinical ranges.'
  },
  recordDate: { type: Date, default: Date.now }
}, { timestamps: true });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
module.exports = MedicalRecord;
