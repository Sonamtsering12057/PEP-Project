import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConsultationChatModal from '../../components/ConsultationChatModal';
import PrescriptionModal from '../../components/PrescriptionModal';
import axios from 'axios';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('appointments');

  // Consultation Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChatAppointment, setSelectedChatAppointment] = useState(null);

  // Prescription Modal States
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [selectedPrescriptionAppt, setSelectedPrescriptionAppt] = useState(null);
  
  // Doctor Profile Form State
  const [profileData, setProfileData] = useState({
    specialization: 'General Physician',
    consultationFee: 500,
    qualifications: 'MBBS, MD',
    address: 'South Extension, New Delhi',
    isVerified: false
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/appointments/doctor', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAppointments(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchDoctorProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/doctors/me/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data?.data?.doctorProfile) {
        const dp = res.data.data.doctorProfile;
        setProfileData({
          specialization: dp.specialization || 'General Physician',
          consultationFee: dp.consultationFee || 500,
          qualifications: Array.isArray(dp.qualifications) ? dp.qualifications.join(', ') : (dp.qualifications || 'MBBS'),
          address: dp.clinicLocation?.address || '',
          isVerified: dp.isVerified || false
        });
      }
    } catch (err) {
      console.error("Error loading doctor profile:", err);
    }
  };

  useEffect(() => { 
    fetchAppointments();
    fetchDoctorProfile();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5001/api/appointments/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchAppointments();
    } catch (err) { alert('Error updating status'); }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const res = await axios.put('http://localhost:5001/api/doctors/me/profile', profileData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.success) {
        setProfileMessage('✅ Profile & Clinic details updated successfully!');
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const pending = appointments.filter(a => a.status === 'Pending');
  const confirmed = appointments.filter(a => a.status === 'Confirmed');

  return (
    <div className="min-h-screen bg-[#080b12] flex">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#0d1117] border-r border-white/8 flex flex-col min-h-screen">
        <div className="p-6 border-b border-white/8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-white font-bold">Wellness Connect</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'appointments', icon: '📋', label: 'Appointments' },
            { id: 'availability', icon: '📅', label: 'Availability' },
            { id: 'profile', icon: '👤', label: 'My Profile' },
          ].map(link => (
            <button key={link.id} onClick={() => setActiveTab(link.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === link.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <span>{link.icon}</span><span>{link.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/8">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{user?.name?.[0] || 'D'}</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium truncate">Dr. {user?.name}</p>
              <p className="text-gray-500 text-xs">Doctor</p>
            </div>
          </div>
          <button onClick={logout} className="w-full text-sm text-gray-400 hover:text-white hover:bg-white/5 py-2.5 px-4 rounded-xl transition-all text-left flex items-center gap-2">
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 bg-[#080b12]/90 backdrop-blur-md border-b border-white/8 px-8 py-4">
          <h1 className="text-white font-bold text-xl">Welcome, Dr. {user?.name} 👨‍⚕️</h1>
          <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: '📋', value: appointments.length, label: 'Total Appointments' },
              { icon: '⏳', value: pending.length, label: 'Pending Review' },
              { icon: '✅', value: confirmed.length, label: 'Confirmed Today' },
            ].map(s => (
              <div key={s.label} className="bg-[#111827] border border-white/8 rounded-2xl p-5">
                <span className="text-2xl">{s.icon}</span>
                <p className="text-3xl font-bold text-white mt-3 mb-1">{s.value}</p>
                <p className="text-gray-400 text-sm">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="bg-[#111827] border border-white/8 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-6">Patient Appointment Requests</h2>
              {appointments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📭</div>
                  <p className="text-gray-400">No appointment requests yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map(appt => (
                    <div key={appt._id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white/3 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                          <span className="text-xl">👤</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">{appt.patient?.name}</p>
                          <p className="text-gray-400 text-sm">{new Date(appt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {appt.timeSlot}</p>
                          <span className={`inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 ${
                            appt.status === 'Confirmed' ? 'bg-green-500/15 text-green-400' :
                            appt.status === 'Pending' ? 'bg-yellow-500/15 text-yellow-400' :
                            'bg-red-500/15 text-red-400'}`}>{appt.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedChatAppointment(appt);
                            setIsChatOpen(true);
                          }}
                          className="bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <span>💬</span> Chat
                        </button>

                        {(appt.status === 'Confirmed' || appt.status === 'Completed') && (
                          <button
                            onClick={() => {
                              setSelectedPrescriptionAppt(appt);
                              setIsPrescriptionOpen(true);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1"
                          >
                            <span>💊</span> {appt.prescription ? 'Edit Rx' : 'Issue Rx'}
                          </button>
                        )}

                        {appt.status === 'Pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => updateStatus(appt._id, 'Confirmed')}
                              className="bg-green-600 hover:bg-green-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-md shadow-green-600/20">
                              ✓ Accept
                            </button>
                            <button onClick={() => updateStatus(appt._id, 'Cancelled')}
                              className="bg-red-600/80 hover:bg-red-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all">
                              ✕ Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === 'availability' && (
            <div className="bg-[#111827] border border-white/8 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-white font-bold text-xl mb-3">Manage Your Availability</h3>
              <p className="text-gray-400 mb-6">Set your clinic working hours, vacation days, and available time slots.</p>
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30">
                Update Schedule
              </button>
            </div>
          )}

          {/* My Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-[#111827] border border-white/8 rounded-2xl p-8 max-w-3xl">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {user?.name?.[0]}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">Dr. {user?.name}</h3>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                  profileData.isVerified
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                }`}>
                  {profileData.isVerified ? '✓ VERIFIED DOCTOR' : '⏳ PENDING VERIFICATION'}
                </span>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-5">
                {profileMessage && (
                  <div className="bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 p-4 rounded-xl text-sm font-medium">
                    {profileMessage}
                  </div>
                )}
                {profileError && (
                  <div className="bg-red-500/15 border border-red-500/25 text-red-400 p-4 rounded-xl text-sm font-medium">
                    ⚠️ {profileError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Medical Specialization
                    </label>
                    <select
                      value={profileData.specialization}
                      onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                      className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      {['General Physician', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Gastroenterologist', 'Pulmonologist', 'Oncologist', 'Rheumatologist', 'Psychiatrist', 'Ophthalmologist'].map(sp => (
                        <option key={sp} value={sp} className="bg-[#111827] text-white">{sp}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Degrees & Qualifications
                  </label>
                  <input
                    type="text"
                    value={profileData.qualifications}
                    onChange={(e) => setProfileData({ ...profileData, qualifications: e.target.value })}
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g. MBBS, MD (Cardiology)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Clinic / Hospital Address
                  </label>
                  <textarea
                    rows={3}
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Full street address of your clinic"
                    required
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
                  >
                    {profileLoading ? 'Saving Changes...' : 'Save Profile Settings →'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Consultation Chat Modal */}
      <ConsultationChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        appointment={selectedChatAppointment}
      />

      {/* Digital Prescription Modal */}
      <PrescriptionModal
        isOpen={isPrescriptionOpen}
        onClose={() => setIsPrescriptionOpen(false)}
        appointment={selectedPrescriptionAppt}
        onPrescriptionSaved={fetchAppointments}
      />
    </div>
  );
};

export default DoctorDashboard;
