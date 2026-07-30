import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';

const AppointmentModal = ({ isOpen, onClose, onBooked, preselectedDoctor }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('09:00 - 09:30 AM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      fetchDoctors();
    }
  }, [isOpen, preselectedDoctor]);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/doctors`);
      const docs = res.data || [];
      setDoctors(docs);
      
      if (preselectedDoctor && preselectedDoctor._id) {
        setSelectedDoctorId(preselectedDoctor._id);
      } else if (docs.length > 0) {
        setSelectedDoctorId(docs[0]._id);
      }
    } catch (err) {
      console.error("Error fetching doctors for modal:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in to book an appointment.');
        setLoading(false);
        return;
      }

      const docObj = doctors.find(d => d._id === selectedDoctorId);
      const fee = docObj?.doctorProfile?.consultationFee || docObj?.fee || 500;

      const res = await axios.post(`${API_BASE}/api/appointments/book`, {
        doctor: selectedDoctorId,
        date,
        timeSlot,
        consultationFee: fee
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setSuccessMsg('🎉 Appointment booked successfully!');
        setTimeout(() => {
          if (onBooked) onBooked();
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const availableSlots = [
    '09:00 - 09:30 AM',
    '10:00 - 10:30 AM',
    '11:30 - 12:00 PM',
    '02:00 - 02:30 PM',
    '04:00 - 04:30 PM',
    '06:00 - 06:30 PM'
  ];

  const currentDoc = doctors.find(d => d._id === selectedDoctorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative text-white">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-white/8 flex items-center justify-between bg-[#0d1117]">
          <div>
            <h3 className="text-xl font-bold">Book Doctor Appointment</h3>
            <p className="text-gray-400 text-xs mt-0.5">Select a doctor, date, and time slot</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-light w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 p-3.5 rounded-xl text-xs font-medium text-center">
              {successMsg}
            </div>
          )}

          {/* Select Doctor */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Select Specialist Doctor
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              required
              className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            >
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id} className="bg-[#111827] text-white">
                  Dr. {doc.name} — {doc.doctorProfile?.specialization || doc.specialization || 'General Physician'}
                </option>
              ))}
            </select>
          </div>

          {currentDoc && (
            <div className="p-3.5 bg-blue-600/10 border border-blue-500/20 rounded-xl flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-blue-200">Dr. {currentDoc.name}</p>
                <p className="text-blue-400">{currentDoc.doctorProfile?.specialization || currentDoc.specialization}</p>
              </div>
              <span className="font-semibold text-emerald-400 text-xs bg-emerald-500/20 px-3 py-1 rounded-lg">
                ✓ Available
              </span>
            </div>
          )}

          {/* Select Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Appointment Date
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Select Time Slot */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Available Time Slot
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableSlots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setTimeSlot(slot)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                    timeSlot === slot
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30'
                      : 'bg-white/3 border-white/8 text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  ⏰ {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-white/15 hover:border-white/30 text-gray-300 hover:text-white text-sm font-semibold py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Confirm Booking →'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AppointmentModal;
