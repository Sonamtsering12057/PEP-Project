const express = require('express');
const router = express.Router();
const MedicalRecord = require('../models/MedicalRecord');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// POST /api/records/upload - Upload record to patient vault
router.post('/upload', protect, restrictTo('Patient'), async (req, res) => {
  try {
    const { title, recordType, fileUrl, fileName, recordDate, notes } = req.body;

    if (!title || !fileUrl) {
      return res.status(400).json({ success: false, message: 'Title and document file are required.' });
    }

    // Auto-generate AI summary based on record type
    let summary = 'Document uploaded to Medical Vault.';
    if (recordType === 'Lab Report') {
      summary = 'Blood panel & biomarker report uploaded. All key indicators indexed for AI tracking.';
    } else if (recordType === 'Prescription') {
      summary = 'Prescription document saved. Medication dosage and doctor notes cataloged.';
    } else if (recordType === 'Imaging / X-Ray') {
      summary = 'Diagnostic imaging file archived in high resolution.';
    } else if (recordType === 'Discharge Summary') {
      summary = 'Hospital admission and discharge summary indexed for health history.';
    }

    if (notes) {
      summary += ` Patient note: "${notes}"`;
    }

    const newRecord = await MedicalRecord.create({
      patient: req.user._id,
      title,
      recordType: recordType || 'Lab Report',
      fileUrl,
      fileName: fileName || 'health_document.pdf',
      aiSummary: summary,
      recordDate: recordDate || new Date()
    });

    res.status(201).json({
      success: true,
      data: newRecord,
      message: 'Medical document uploaded to vault successfully!'
    });
  } catch (error) {
    console.error("Record Upload Error:", error);
    res.status(500).json({ success: false, message: error.message || 'Failed to upload medical record.' });
  }
});

// GET /api/records/my-vault - Fetch patient's medical records
router.get('/my-vault', protect, restrictTo('Patient'), async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.user._id })
      .sort({ recordDate: -1 });
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/records/:id - Delete a record
router.delete('/:id', protect, restrictTo('Patient'), async (req, res) => {
  try {
    const record = await MedicalRecord.findOneAndDelete({ _id: req.params.id, patient: req.user._id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found.' });
    }
    res.json({ success: true, message: 'Medical record deleted from vault.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
