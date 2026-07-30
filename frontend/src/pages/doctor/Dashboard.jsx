import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ConsultationChatModal from '../../components/ConsultationChatModal';
import PrescriptionModal from '../../components/PrescriptionModal';
import { API_BASE } from '../../config/api';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [selectedChatAppointment, setSelectedChatAppointment] = useState(null);
  const [selectedRxAppointment, setSelectedRxAppointment] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRxOpen, setIsRxOpen] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    specialization: 'General Physician',
    qualifications: 'MBBS, MD',
    address: 'Johal Multispecialty Hospital, GT Road, Phagwara, Punjab',
    isVerified: true
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/appointments/doctor`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAppointments(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchDoctorProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/doctors/me/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data?.data?.doctorProfile) {
        const dp = res.data.data.doctorProfile;
        setProfileData({
          specialization: dp.specialization || 'General Physician',
          qualifications: Array.isArray(dp.qualifications) ? dp.qualifications.join(', ') : (dp.qualifications || 'MBBS'),
          address: dp.clinicLocation?.address || 'Johal Multispecialty Hospital, GT Road, Phagwara, Punjab',
          isVerified: dp.isVerified !== undefined ? dp.isVerified : true
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
      await axios.patch(`${API_BASE}/api/appointments/${id}/status`, { status }, {
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
      const payload = {
        ...profileData,
        isVerified: true,
        clinicAddress: profileData.address,
        coordinates: [75.7720, 31.2240] // Default Phagwara / Punjab coordinates
      };

      const res = await axios.put(`${API_BASE}/api/doctors/me/profile`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.success) {
        setProfileMessage('✅ Profile & Clinic details updated! You are now live on 3D Doctor Maps.');
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
    <div className="min-h-screen bg-slate-50 flex text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col min-h-screen">
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-sm">W</div>
            <span className="text-gray-900 font-extrabold text-base">Wellness Connect</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'appointments', icon: '📋', label: 'Appointments' },
            { id: 'availability', icon: '📅', label: 'Availability' },
            { id: 'profile', icon: '👤', label: 'My Profile' },
          ].map(link => (
            <button key={link.id} onClick={() => setActiveTab(link.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                activeTab === link.id ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-800 text-xs">
              Dr
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">Dr. {user?.name}</p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Verified Doctor</span>
            </div>
          </div>
          <button onClick={logout} className="w-full text-center text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 py-2 rounded-xl transition-all">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Doctor Practice Command Center</h1>
              <p className="text-gray-500 text-xs mt-1">Manage appointments, tele-consultation chat, digital prescriptions, and profile verification.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                ● Status: Active & Available
              </span>
            </div>
          </div>

          {/* Tab 1: Appointments */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Requests</p>
                  <p className="text-3xl font-black text-amber-600 mt-1">{pending.length}</p>
                </div>
                <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirmed Consultations</p>
                  <p className="text-3xl font-black text-emerald-600 mt-1">{confirmed.length}</p>
                </div>
                <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Appointments</p>
                  <p className="text-3xl font-black text-blue-600 mt-1">{appointments.length}</p>
                </div>
              </div>

              {/* Appointments List */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Patient Appointment Roster</h3>
                
                {appointments.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm font-medium">
                    📋 No appointments booked yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map(appt => (
                      <div key={appt._id} className="p-4 rounded-xl bg-slate-50 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-gray-900 text-base">Patient: {appt.patient?.name || 'Patient'}</span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              appt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {appt.status}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs mt-1">📅 Date: {appt.date} · ⏰ Slot: {appt.timeSlot}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {appt.status === 'Pending' && (
                            <button
                              onClick={() => updateStatus(appt._id, 'Confirmed')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                            >
                              Accept Appointment
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedChatAppointment(appt);
                              setIsChatOpen(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1 shadow-sm"
                          >
                            <span>💬</span> Consultation Chat
                          </button>

                          <button
                            onClick={() => {
                              setSelectedRxAppointment(appt);
                              setIsRxOpen(true);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1 shadow-sm"
                          >
                            <span>📑</span> Issue Prescription Rx
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Profile Settings */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-3xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Doctor Profile & Clinic Map Settings</h3>
              
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                {profileMessage && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm font-medium">
                    {profileMessage}
                  </div>
                )}
                {profileError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
                    ⚠️ {profileError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Medical Specialization
                  </label>
                  <select
                    value={profileData.specialization}
                    onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {['General Physician', 'General Medicine & Geriatrics', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Gastroenterologist', 'Pulmonologist', 'Oncologist', 'Rheumatologist', 'Psychiatrist', 'ENT Specialist'].map(sp => (
                      <option key={sp} value={sp}>{sp}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Degrees & Qualifications
                  </label>
                  <input
                    type="text"
                    value={profileData.qualifications}
                    onChange={(e) => setProfileData({ ...profileData, qualifications: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    placeholder="e.g. MBBS, MD (Cardiology)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Clinic / Hospital Address
                  </label>
                  <textarea
                    rows={3}
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    placeholder="e.g. Johal Multispecialty Hospital, GT Road, Phagwara, Punjab"
                    required
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3 rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 text-sm"
                  >
                    {profileLoading ? 'Saving Changes...' : 'Save Profile & Show on 3D Map →'}
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

      {/* Prescription Modal */}
      <PrescriptionModal
        isOpen={isRxOpen}
        onClose={() => setIsRxOpen(false)}
        appointment={selectedRxAppointment}
      />
    </div>
  );
};

export default DoctorDashboard;
