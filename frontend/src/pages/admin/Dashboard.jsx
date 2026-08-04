import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Medical3DBackground from '../../components/Medical3DBackground';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [metrics, setMetrics] = useState({ totalPatients: 0, totalDoctors: 0, pendingAppointments: 0, totalMessages: 0 });
  const [messages, setMessages] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchMetrics();
    fetchMessages();
    fetchDoctors();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/admin/metrics', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMetrics(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/messages', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/doctors/admin/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDoctorsList(res.data.data || []);
    } catch (err) { console.error("Error loading admin doctors:", err); }
  };

  const toggleVerification = async (doctorId) => {
    setActionLoadingId(doctorId);
    try {
      const res = await axios.patch(`http://localhost:5001/api/doctors/admin/${doctorId}/verify`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.success) {
        fetchDoctors();
        fetchMetrics();
      }
    } catch (err) {
      alert("Failed to toggle doctor verification status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const statCards = [
    { icon: '🩺', value: metrics.totalDoctors, label: 'Registered Doctors', color: 'blue' },
    { icon: '👤', value: metrics.totalPatients, label: 'Registered Patients', color: 'purple' },
    { icon: '⏳', value: metrics.pendingAppointments, label: 'Pending Appointments', color: 'yellow' },
    { icon: '✉️', value: metrics.totalMessages, label: 'New Messages', color: 'green' },
  ];

  return (
    <div className="relative min-h-screen bg-[#080b12]/60 backdrop-blur-sm flex overflow-hidden">
      <Medical3DBackground />
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#0d1117]/80 backdrop-blur-md border-r border-white/8 flex flex-col min-h-screen">
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
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'messages', icon: '✉️', label: 'Messages' },
            { id: 'doctors', icon: '🩺', label: 'Doctor Approvals' },
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
              <span className="text-white font-bold text-sm">{user?.name?.[0] || 'A'}</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs">Admin</p>
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
          <h1 className="text-white font-bold text-xl">Admin Command Center 👑</h1>
          <p className="text-gray-500 text-sm">Doctor verification and system operations</p>
        </div>

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map(s => (
              <div key={s.label} className="bg-[#111827] border border-white/8 rounded-2xl p-5">
                <span className="text-2xl">{s.icon}</span>
                <p className="text-3xl font-bold text-white mt-3 mb-1">{s.value}</p>
                <p className="text-gray-400 text-sm">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#111827] border border-white/8 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-6">Platform Health</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Doctor Verification Rate', pct: doctorsList.length > 0 ? Math.round((doctorsList.filter(d => d.doctorProfile?.isVerified).length / doctorsList.length) * 100) : 100, color: 'bg-blue-500' },
                    { label: 'Appointment Success Rate', pct: 92, color: 'bg-green-500' },
                    { label: 'Patient Satisfaction', pct: 96, color: 'bg-purple-500' },
                  ].map(b => (
                    <div key={b.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">{b.label}</span>
                        <span className="text-white font-semibold">{b.pct}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${b.color} rounded-full`} style={{ width: `${b.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#111827] border border-white/8 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-bold text-lg">Recent Messages</h3>
                  <button onClick={() => setActiveTab('messages')} className="text-blue-400 text-sm hover:underline">View all →</button>
                </div>
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No messages yet</p>
                ) : (
                  <div className="space-y-3">
                    {messages.slice(0, 3).map(msg => (
                      <div key={msg._id} className="p-4 bg-white/3 border border-white/5 rounded-xl">
                        <div className="flex justify-between mb-1">
                          <p className="text-white font-semibold text-sm">{msg.firstName} {msg.lastName}</p>
                          <span className="text-gray-600 text-xs">{new Date(msg.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-400 text-sm truncate">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="bg-[#111827] border border-white/8 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-6">All Contact Messages</h2>
              {messages.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📭</div>
                  <p className="text-gray-400">No messages received yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div key={msg._id} className="p-5 bg-white/3 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{msg.firstName?.[0]}{msg.lastName?.[0]}</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">{msg.firstName} {msg.lastName}</p>
                            <p className="text-blue-400 text-xs">{msg.email} · {msg.phone}</p>
                          </div>
                        </div>
                        <span className="text-gray-500 text-xs">{new Date(msg.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-300 text-sm bg-white/3 rounded-xl p-3 leading-relaxed">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Doctor Verification Approvals Tab */}
          {activeTab === 'doctors' && (
            <div className="bg-[#111827] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-white font-bold text-lg">Doctor Verification Queue</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Review and approve registered medical practitioners on the platform</p>
                </div>
                <span className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 px-3 py-1 rounded-full font-medium">
                  {doctorsList.length} Total Doctors
                </span>
              </div>

              {doctorsList.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🩺</div>
                  <p className="text-gray-400">No doctors registered yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {doctorsList.map(doc => {
                    const isVerified = doc.doctorProfile?.isVerified;
                    return (
                      <div key={doc._id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white/3 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {doc.name?.[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="text-white font-bold text-base">{doc.name}</h4>
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                isVerified
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                  : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                              }`}>
                                {isVerified ? '✓ VERIFIED' : '⏳ PENDING'}
                              </span>
                            </div>
                            <p className="text-blue-400 text-xs font-medium mt-0.5">
                              {doc.doctorProfile?.specialization || 'General Physician'}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              📧 {doc.email} | 📍 {doc.doctorProfile?.clinicLocation?.address || 'Address not specified'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleVerification(doc._id)}
                            disabled={actionLoadingId === doc._id}
                            className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md ${
                              isVerified
                                ? 'bg-amber-600/80 hover:bg-amber-500 text-white'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                            } disabled:opacity-50`}
                          >
                            {actionLoadingId === doc._id
                              ? 'Updating...'
                              : isVerified
                              ? 'Revoke Approval'
                              : '✓ Approve Doctor'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
