import React, { useState } from 'react';
import axios from 'axios';

const PrescriptionModal = ({ isOpen, onClose, appointment, onPrescriptionSaved }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: 'Twice daily (After meals)', duration: '5 days' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen || !appointment) return null;

  const handleMedChange = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const addMedicationRow = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: 'Twice daily (After meals)', duration: '5 days' }]);
  };

  const removeMedicationRow = (index) => {
    if (medications.length === 1) return;
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const validMeds = medications.filter(m => m.name.trim() !== '');
      if (validMeds.length === 0) {
        setError('Please add at least one prescribed medication.');
        setLoading(false);
        return;
      }

      const prescriptionData = {
        diagnosis,
        notes,
        medications: validMeds,
        issuedAt: new Date().toISOString()
      };

      const res = await axios.patch(`http://localhost:5001/api/appointments/${appointment._id}/prescription`, {
        prescription: JSON.stringify(prescriptionData),
        notes: notes || `Diagnosis: ${diagnosis}`
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.data.success) {
        setSuccess('✓ Digital Prescription issued successfully!');
        setTimeout(() => {
          if (onPrescriptionSaved) onPrescriptionSaved();
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue prescription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative text-white flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/8 bg-[#0d1117] flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>💊</span> Issue Digital Rx Prescription
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">
              Patient: <strong className="text-white">{appointment.patient?.name}</strong> · Date: {new Date(appointment.date).toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-light w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
            &times;
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="bg-red-500/15 border border-red-500/25 text-red-400 p-3.5 rounded-xl text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 p-3.5 rounded-xl text-xs font-medium text-center">
              {success}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Clinical Diagnosis / Primary Observation
            </label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Mild Upper Respiratory Infection / Acute Hypertension"
              className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Prescribed Medications (Rx)
              </label>
              <button
                type="button"
                onClick={addMedicationRow}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                + Add Medicine
              </button>
            </div>

            <div className="space-y-3">
              {medications.map((med, idx) => (
                <div key={idx} className="p-3 bg-[#0d1117] border border-white/8 rounded-xl grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <input
                      type="text"
                      required
                      placeholder="Medicine Name (e.g. Paracetamol)"
                      value={med.name}
                      onChange={(e) => handleMedChange(idx, 'name', e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Dosage (500mg)"
                      value={med.dosage}
                      onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-3">
                    <select
                      value={med.frequency}
                      onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 text-white text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Once daily (Morning)">Once daily (Morning)</option>
                      <option value="Twice daily (After meals)">Twice daily (After meals)</option>
                      <option value="Thrice daily (8 hrs)">Thrice daily (8 hrs)</option>
                      <option value="As needed (PRN)">As needed (PRN)</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Duration (5 days)"
                      value={med.duration}
                      onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 text-white text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-1 text-center">
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicationRow(idx)}
                        className="text-gray-500 hover:text-red-400 font-bold text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Dietary & Lifestyle Advice / Special Instructions
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Drink plenty of warm water, rest for 3 days, avoid heavy meals."
              className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-white/15 hover:border-white/30 text-gray-300 py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Issuing Prescription...' : 'Issue Prescription →'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default PrescriptionModal;
