import React, { useState, useEffect } from 'react';
import AIChatbot from '../../components/AIChatbot';
import DiscoveryMap from '../../components/DiscoveryMap';
import AppointmentModal from '../../components/AppointmentModal';
import ConsultationChatModal from '../../components/ConsultationChatModal';
import LanguageSelector from '../../components/LanguageSelector';
import Medical3DBackground from '../../components/Medical3DBackground';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const StatCard = ({ icon, value, label, sub }) => (
  <div className="bg-[#111827] border border-white/8 rounded-2xl p-5 hover:border-blue-500/20 transition-all">
    <div className="flex items-center justify-between mb-4">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">{sub}</span>
    </div>
    <p className="text-3xl font-bold text-white mb-1">{value}</p>
    <p className="text-gray-400 text-sm">{label}</p>
  </div>
);

const PatientDashboard = () => {
  const [recommendedSpecialty, setRecommendedSpecialty] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Consultation Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChatAppointment, setSelectedChatAppointment] = useState(null);

  // Record upload modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', recordType: 'Lab Report', fileUrl: '', fileName: '', notes: '' });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  // Vitals Biometrics States
  const [vitalsList, setVitalsList] = useState([]);
  const [isVitalModalOpen, setIsVitalModalOpen] = useState(false);
  const [vitalData, setVitalData] = useState({
    bloodPressureSystolic: '120',
    bloodPressureDiastolic: '80',
    heartRate: '72',
    fastingGlucose: '95',
    weightKg: '68',
    notes: 'Morning measurement before breakfast'
  });
  const [vitalLoading, setVitalLoading] = useState(false);

  const fetchVitals = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/vitals', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setVitalsList(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const submitVital = async (e) => {
    e.preventDefault();
    setVitalLoading(true);
    try {
      await axios.post('http://localhost:5001/api/vitals', vitalData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchVitals();
      setIsVitalModalOpen(false);
    } catch (err) {
      alert("Error saving vital entry");
    } finally {
      setVitalLoading(false);
    }
  };

  const deleteVital = async (id) => {
    if (!window.confirm("Delete this vital entry?")) return;
    try {
      await axios.delete(`http://localhost:5001/api/vitals/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchVitals();
    } catch (err) { alert("Failed to delete vital entry"); }
  };

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/appointments/patient', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAppointments(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchPredictionHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/predictions/my-history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPredictionHistory(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchMedicalRecords = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/records/my-vault', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMedicalRecords(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchAppointments();
    fetchPredictionHistory();
    fetchMedicalRecords();
    fetchVitals();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error(err)
      );
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadData({ ...uploadData, fileUrl: reader.result, fileName: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const submitRecordUpload = async (e) => {
    e.preventDefault();
    setUploadLoading(true);
    setUploadMsg('');
    try {
      const res = await axios.post('http://localhost:5001/api/records/upload', uploadData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.success) {
        setUploadMsg('✓ Document uploaded to vault successfully!');
        fetchMedicalRecords();
        setTimeout(() => {
          setIsUploadOpen(false);
          setUploadData({ title: '', recordType: 'Lab Report', fileUrl: '', fileName: '', notes: '' });
          setUploadMsg('');
        }, 1000);
      }
    } catch (err) {
      setUploadMsg('Failed to upload record');
    } finally {
      setUploadLoading(false);
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document from your vault?")) return;
    try {
      await axios.delete(`http://localhost:5001/api/records/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchMedicalRecords();
    } catch (err) {
      alert("Error deleting record");
    }
  };

  const downloadRxPDF = (appt) => {
    if (!appt.prescription) return;
    try {
      const rx = JSON.parse(appt.prescription);
      const doc = new jsPDF();

      // Header
      doc.setFillColor(17, 24, 39);
      doc.rect(0, 0, 210, 38, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('WELLNESS CONNECT — DIGITAL PRESCRIPTION', 14, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Official Medical Rx Document · Date: ${new Date(appt.date).toLocaleDateString()}`, 14, 28);

      // Doctor & Patient Meta
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Doctor: Dr. ${appt.doctor?.name || 'Practitioner'}`, 14, 50);
      doc.setFont('helvetica', 'normal');
      doc.text(`Specialty: ${appt.doctor?.doctorProfile?.specialization || 'General Physician'}`, 14, 57);
      doc.text(`Clinic Address: ${appt.doctor?.doctorProfile?.clinicLocation?.address || 'Wellness Medical Clinic'}`, 14, 64);

      doc.setFont('helvetica', 'bold');
      doc.text(`Patient: ${user?.name}`, 120, 50);
      doc.setFont('helvetica', 'normal');
      doc.text(`Email: ${user?.email}`, 120, 57);
      doc.text(`Appointment ID: #${appt._id.slice(-6).toUpperCase()}`, 120, 64);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 72, 196, 72);

      // Diagnosis Box
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Clinical Diagnosis:`, 14, 84);
      doc.setFillColor(241, 245, 249);
      doc.rect(14, 88, 182, 16, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(rx.diagnosis || 'Clinical evaluation completed.', 18, 98);

      // Rx Medications Table
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Prescribed Medications (Rx):', 14, 118);

      doc.setFillColor(37, 99, 235);
      doc.rect(14, 124, 182, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('Medicine Name', 18, 131);
      doc.text('Dosage', 85, 131);
      doc.text('Frequency', 125, 131);
      doc.text('Duration', 170, 131);

      let y = 142;
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      (rx.medications || []).forEach((med, i) => {
        if (i % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y - 6, 182, 9, 'F');
        }
        doc.text(med.name || 'Medicine', 18, y);
        doc.text(med.dosage || 'Standard', 85, y);
        doc.text(med.frequency || 'Daily', 125, y);
        doc.text(med.duration || '5 days', 170, y);
        y += 10;
      });

      // Special Notes / Advice
      if (rx.notes) {
        y += 6;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Doctor Instructions & Lifestyle Advice:', 14, y);
        y += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(rx.notes, 14, y);
      }

      // Footer Signature Block
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Digitally Signed by Medical Practitioner', 14, 275);
      doc.text('Wellness Connect Telehealth Platform', 14, 280);

      doc.save(`Prescription_${appt.doctor?.name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      alert("Downloading standard Rx summary...");
    }
  };

  const downloadReceiptPDF = (appt) => {
    try {
      const doc = new jsPDF();
      const fee = appt.doctor?.doctorProfile?.consultationFee || 500;
      const invoiceNo = `INV-${new Date().getFullYear()}-${appt._id.slice(-5).toUpperCase()}`;

      // Header Branding
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 42, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('WELLNESS CONNECT', 14, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Telehealth Consultation Official Payment Receipt', 14, 28);
      doc.text(`Receipt #: ${invoiceNo}`, 140, 20);
      doc.text(`Issued Date: ${new Date().toLocaleDateString()}`, 140, 28);

      // Meta Block
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Billed To (Patient):', 14, 55);
      doc.setFont('helvetica', 'normal');
      doc.text(user?.name || 'Patient', 14, 62);
      doc.text(user?.email || '', 14, 68);

      doc.setFont('helvetica', 'bold');
      doc.text('Practitioner & Clinic:', 120, 55);
      doc.setFont('helvetica', 'normal');
      doc.text(`Dr. ${appt.doctor?.name || 'Doctor'}`, 120, 62);
      doc.text(`${appt.doctor?.doctorProfile?.specialization || 'General Physician'}`, 120, 68);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 76, 196, 76);

      // Itemized Table Header
      doc.setFillColor(37, 99, 235);
      doc.rect(14, 85, 182, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Description / Service Item', 18, 91.5);
      doc.text('Date & Time', 110, 91.5);
      doc.text('Amount Paid', 165, 91.5);

      // Row 1: Consultation
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.text(`Specialist Telehealth Consultation (Dr. ${appt.doctor?.name})`, 18, 104);
      doc.text(`${new Date(appt.date).toLocaleDateString()} · ${appt.timeSlot}`, 110, 104);
      doc.text(`₹${fee}.00`, 165, 104);

      // Row 2: Service Fee
      doc.text('Wellness Telehealth Platform Service Fee', 18, 114);
      doc.text(`${new Date(appt.date).toLocaleDateString()}`, 110, 114);
      doc.text(`₹0.00 (Waived)`, 165, 114);

      doc.line(14, 122, 196, 122);

      // Total Box
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Amount Paid:', 110, 134);
      doc.setTextColor(16, 185, 129);
      doc.text(`₹${fee}.00 INR`, 165, 134);

      // Paid Badge Watermark
      doc.setFillColor(220, 252, 231);
      doc.rect(14, 150, 182, 22, 'F');
      doc.setDrawColor(34, 197, 94);
      doc.rect(14, 150, 182, 22, 'S');
      doc.setTextColor(21, 128, 61);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('STATUS: COMPLETED & PAID IN FULL', 20, 164);

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Thank you for choosing Wellness Connect for your health and medical care.', 14, 280);

      doc.save(`Invoice_${invoiceNo}.pdf`);
    } catch (err) {
      alert("Error generating payment receipt PDF");
    }
  };

  const sidebarLinks = [
    { id: 'overview', icon: '🏠', label: 'Overview' },
    { id: 'appointments', icon: '📅', label: 'Appointments' },
    { id: 'doctors', icon: '🗺️', label: 'Find Doctors' },
    { id: 'vault', icon: '📁', label: 'Medical Vault' },
    { id: 'vitals', icon: '📊', label: 'Vital Trends' },
    { id: 'analytics', icon: '🔮', label: 'Predictive AI' },
    { id: 'health-ai', icon: '🧠', label: 'Health Intelligence' },
  ];

  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  return (
    <div className="relative min-h-screen bg-[#080b12]/60 backdrop-blur-sm flex overflow-hidden">
      <Medical3DBackground />

      {/* ── Sidebar ── */}
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
          {sidebarLinks.map(link => (
            <button
              key={link.id}
              onClick={() => {
                if (link.id === 'analytics') navigate('/predict');
                else if (link.id === 'health-ai') navigate('/intelligence');
                else setActiveTab(link.id);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === link.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/8">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{user?.name?.[0] || 'P'}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs">Patient</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-sm text-gray-400 hover:text-white hover:bg-white/5 py-2.5 px-4 rounded-xl transition-all text-left flex items-center gap-2"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-[#080b12]/90 backdrop-blur-md border-b border-white/8 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl">
              {activeTab === 'overview' ? `Welcome back, ${user?.name?.split(' ')[0]} 👋` :
               activeTab === 'appointments' ? 'My Appointments' :
               activeTab === 'vault' ? 'Medical Records Vault 📁' :
               activeTab === 'doctors' ? 'Find Doctors Near You' : 'Dashboard'}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 border border-white/15 hover:border-white/30 text-gray-300 hover:text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-sm"
            >
              <span>📁</span> Upload Record
            </button>
            <button
              onClick={() => {
                setSelectedDoctorForBooking(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 text-sm"
            >
              <span>+</span> Book Appointment
            </button>
          </div>
        </div>

        <div className="p-8">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon="📅" value={appointments.length} label="Appointments" sub="Total" />
                <StatCard icon="📁" value={medicalRecords.length} label="Vault Records" sub="Uploaded" />
                <StatCard icon="🔮" value={predictionHistory.length} label="AI Scans Run" sub="ML" />
                <StatCard icon="❤️" value="Good" label="Health Status" sub="AI" />
              </div>

              {/* AI Health Signal */}
              <div className="bg-gradient-to-r from-blue-600/15 to-purple-600/10 border border-blue-500/20 rounded-2xl p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-emerald-400 text-sm font-semibold">Health Status: Optimal</span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">Vault Synced & AI Tracking Active</h3>
                    <p className="text-gray-400 text-sm">{medicalRecords.length} records in Medical Vault · {predictionHistory.length} ML risk models run.</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setActiveTab('vault')} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all whitespace-nowrap">
                      Open Vault
                    </button>
                    <Link to="/predict" className="border border-white/15 hover:border-white/30 text-gray-300 hover:text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all whitespace-nowrap">
                      Run AI Scan
                    </Link>
                  </div>
                </div>
              </div>

              {/* Two Column: Appointments + Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Recent Appointments */}
                <div className="lg:col-span-2 bg-[#111827] border border-white/8 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-bold text-lg">Recent Appointments</h3>
                    <button onClick={() => setActiveTab('appointments')} className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">View all →</button>
                  </div>
                  {appointments.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="text-5xl mb-4">📋</div>
                      <p className="text-gray-400 mb-4">No appointments yet</p>
                      <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
                        Book First Appointment
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {appointments.slice(0, 3).map(appt => (
                        <div key={appt._id} className="flex items-center justify-between p-4 bg-white/3 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                              <span className="text-lg">👨‍⚕️</span>
                            </div>
                            <div>
                              <p className="text-white font-semibold text-sm">Dr. {appt.doctor?.name}</p>
                              <p className="text-gray-500 text-xs">{new Date(appt.date).toLocaleDateString()} · {appt.timeSlot}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            appt.status === 'Confirmed' ? 'bg-green-500/15 text-green-400' :
                            appt.status === 'Pending' ? 'bg-yellow-500/15 text-yellow-400' :
                            'bg-gray-500/15 text-gray-400'
                          }`}>{appt.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="bg-[#111827] border border-white/8 rounded-2xl p-6">
                  <h3 className="text-white font-bold text-lg mb-6">Quick Actions</h3>
                  <div className="space-y-3">
                    {[
                      { icon: '📁', label: 'Medical Vault', sub: 'Manage lab reports & X-rays', action: () => setActiveTab('vault') },
                      { icon: '🔮', label: 'Predictive Analytics', sub: 'ML Disease Risk Analysis', link: '/predict' },
                      { icon: '🗺️', label: 'Find Doctors', sub: 'Near your location', action: () => setActiveTab('doctors') },
                    ].map(a => (
                      <button
                        key={a.label}
                        onClick={a.action || (() => navigate(a.link))}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/8 transition-all text-left group"
                      >
                        <span className="text-xl">{a.icon}</span>
                        <div>
                          <p className="text-white text-sm font-medium group-hover:text-blue-300 transition-colors">{a.label}</p>
                          <p className="text-gray-500 text-xs">{a.sub}</p>
                        </div>
                        <span className="ml-auto text-gray-600 group-hover:text-blue-400 transition-colors">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── APPOINTMENTS TAB ── */}
          {activeTab === 'appointments' && (
            <div>
              <div className="flex justify-end mb-6">
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
                  + New Appointment
                </button>
              </div>
              {appointments.length === 0 ? (
                <div className="bg-[#111827] border border-white/8 rounded-2xl p-16 text-center">
                  <div className="text-6xl mb-5">📭</div>
                  <h3 className="text-white font-bold text-xl mb-3">No Appointments Yet</h3>
                  <p className="text-gray-400 mb-6">Book your first appointment with a doctor on our platform.</p>
                  <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3 rounded-xl transition-all">
                    Book Appointment
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map(appt => (
                    <div key={appt._id} className="bg-[#111827] border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">👨‍⚕️</span>
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg">Dr. {appt.doctor?.name}</h3>
                            <p className="text-blue-400 text-sm font-medium">{appt.doctor?.doctorProfile?.specialization || 'General Physician'}</p>
                            <p className="text-gray-500 text-sm mt-1">📅 {new Date(appt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })} · ⏰ {appt.timeSlot}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedChatAppointment(appt);
                              setIsChatOpen(true);
                            }}
                            className="bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                          >
                            <span>💬</span> Consultation Chat
                          </button>

                          {appt.prescription && (
                            <button
                              onClick={() => downloadRxPDF(appt)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                            >
                              <span>📄</span> Download Rx PDF
                            </button>
                          )}

                          <button
                            onClick={() => downloadReceiptPDF(appt)}
                            className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-white/10 transition-all flex items-center gap-1.5"
                            title="Download Consultation Payment Invoice"
                          >
                            <span>🧾</span> Receipt
                          </button>

                          <span className={`text-sm font-semibold px-4 py-2 rounded-xl ${
                            appt.status === 'Confirmed' ? 'bg-green-500/15 text-green-400 border border-green-500/20' :
                            appt.status === 'Pending' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' :
                            appt.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                            appt.status === 'Cancelled' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                            'bg-gray-500/15 text-gray-400 border border-gray-500/20'
                          }`}>{appt.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── MEDICAL VAULT TAB ── */}
          {activeTab === 'vault' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-white font-bold text-xl">Personal Health Documents Vault</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Securely store, organize, and view AI summaries of your medical records</p>
                </div>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 text-sm flex items-center gap-2"
                >
                  <span>📤</span> Upload Document
                </button>
              </div>

              {medicalRecords.length === 0 ? (
                <div className="bg-[#111827] border border-white/8 rounded-2xl p-16 text-center">
                  <div className="text-6xl mb-4">📁</div>
                  <h3 className="text-white font-bold text-xl mb-2">Your Vault is Empty</h3>
                  <p className="text-gray-400 mb-6 text-sm">Upload lab reports, prescriptions, or X-rays to get AI summaries and keep your records safe.</p>
                  <button onClick={() => setIsUploadOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm">
                    Upload First Document →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {medicalRecords.map((rec) => {
                    const iconMap = {
                      'Lab Report': '🩸',
                      'Prescription': '📝',
                      'Imaging / X-Ray': '🩻',
                      'Discharge Summary': '📑',
                      'Other': '📄'
                    };
                    return (
                      <div key={rec._id} className="bg-[#111827] border border-white/8 rounded-2xl p-6 hover:border-blue-500/30 transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                                {iconMap[rec.recordType] || '📄'}
                              </div>
                              <div>
                                <h3 className="text-white font-bold text-base">{rec.title}</h3>
                                <p className="text-blue-400 text-xs font-semibold">{rec.recordType} · {new Date(rec.recordDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <button onClick={() => deleteRecord(rec._id)} className="text-gray-500 hover:text-red-400 transition-colors p-1" title="Delete document">
                              ✕
                            </button>
                          </div>

                          <div className="bg-white/3 border border-white/5 rounded-xl p-3.5 mb-4">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="text-blue-400 text-xs">✨</span>
                              <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">AI Summary</span>
                            </div>
                            <p className="text-gray-300 text-xs leading-relaxed">{rec.aiSummary}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <span className="text-gray-500 text-xs truncate max-w-[180px]">{rec.fileName}</span>
                          <a
                            href={rec.fileUrl}
                            download={rec.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                          >
                            View Document →
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── VITAL TRENDS & BIOMETRICS TAB ── */}
          {activeTab === 'vitals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-bold text-xl">Vital Health Indicators & Trends</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Track daily blood pressure, fasting glucose, heart rate, and weight</p>
                </div>
                <button
                  onClick={() => setIsVitalModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 text-sm flex items-center gap-2"
                >
                  <span>➕</span> Log New Measurement
                </button>
              </div>

              {/* Latest Biometric Indicators Grid */}
              {vitalsList.length > 0 && (() => {
                const latest = vitalsList[0];
                const bpStatus = latest.bloodPressureSystolic >= 140 || latest.bloodPressureDiastolic >= 90 ? 'High (Hypertension)' :
                                 latest.bloodPressureSystolic >= 120 || latest.bloodPressureDiastolic >= 80 ? 'Elevated (Pre-hypertension)' : 'Normal BP';
                const glucoseStatus = latest.fastingGlucose >= 126 ? 'Diabetic Range' :
                                      latest.fastingGlucose >= 100 ? 'Prediabetic Range' : 'Normal Glucose';
                const hrStatus = latest.heartRate > 100 ? 'Tachycardia' : latest.heartRate < 60 ? 'Bradycardia' : 'Normal Heart Rate';

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#111827] border border-white/8 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">🫀</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          bpStatus.includes('Normal') ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                        }`}>{bpStatus}</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{latest.bloodPressureSystolic}/{latest.bloodPressureDiastolic} <span className="text-xs font-normal text-gray-400">mmHg</span></p>
                      <p className="text-gray-400 text-xs mt-1">Blood Pressure</p>
                    </div>

                    <div className="bg-[#111827] border border-white/8 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">🩸</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          glucoseStatus.includes('Normal') ? 'bg-emerald-500/15 text-emerald-400' : 'bg-yellow-500/15 text-yellow-400'
                        }`}>{glucoseStatus}</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{latest.fastingGlucose} <span className="text-xs font-normal text-gray-400">mg/dL</span></p>
                      <p className="text-gray-400 text-xs mt-1">Fasting Glucose</p>
                    </div>

                    <div className="bg-[#111827] border border-white/8 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">💓</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">{hrStatus}</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{latest.heartRate} <span className="text-xs font-normal text-gray-400">bpm</span></p>
                      <p className="text-gray-400 text-xs mt-1">Heart Rate</p>
                    </div>

                    <div className="bg-[#111827] border border-white/8 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">⚖️</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">Body Mass</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{latest.weightKg} <span className="text-xs font-normal text-gray-400">kg</span></p>
                      <p className="text-gray-400 text-xs mt-1">Weight</p>
                    </div>
                  </div>
                );
              })()}

              {/* Vitals History Table */}
              <div className="bg-[#111827] border border-white/8 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/8">
                  <h3 className="text-white font-bold text-base">Biometric Timeline Log</h3>
                </div>

                {vitalsList.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-5xl mb-3">📊</div>
                    <p className="text-gray-400 text-sm mb-4">No vital logs recorded yet.</p>
                    <button onClick={() => setIsVitalModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs">
                      Record First Measurement →
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                      <thead className="bg-[#0d1117] text-xs text-gray-400 uppercase tracking-wider border-b border-white/8">
                        <tr>
                          <th className="py-3.5 px-6">Recorded Date</th>
                          <th className="py-3.5 px-6">Blood Pressure</th>
                          <th className="py-3.5 px-6">Fasting Glucose</th>
                          <th className="py-3.5 px-6">Heart Rate</th>
                          <th className="py-3.5 px-6">Weight</th>
                          <th className="py-3.5 px-6">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {vitalsList.map((v) => (
                          <tr key={v._id} className="hover:bg-white/2 transition-colors">
                            <td className="py-4 px-6 text-white font-medium">{new Date(v.recordedAt).toLocaleString()}</td>
                            <td className="py-4 px-6 font-semibold text-blue-400">{v.bloodPressureSystolic}/{v.bloodPressureDiastolic} mmHg</td>
                            <td className="py-4 px-6 font-semibold text-emerald-400">{v.fastingGlucose} mg/dL</td>
                            <td className="py-4 px-6">{v.heartRate} bpm</td>
                            <td className="py-4 px-6">{v.weightKg} kg</td>
                            <td className="py-4 px-6">
                              <button onClick={() => deleteVital(v._id)} className="text-gray-500 hover:text-red-400 text-xs transition-colors">
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── FIND DOCTORS TAB ── */}
          {activeTab === 'doctors' && (
            <div>
              {recommendedSpecialty && (
                <div className="mb-6 flex items-center gap-3 bg-blue-600/10 border border-blue-500/20 rounded-xl p-4">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <p className="text-blue-300 text-sm font-medium">AI filtering for: <strong className="text-blue-200">{recommendedSpecialty}</strong></p>
                  <button onClick={() => setRecommendedSpecialty('')} className="ml-auto text-sm text-gray-400 hover:text-white transition-colors">✕ Clear</button>
                </div>
              )}
              <div className="bg-[#111827] border border-white/8 rounded-2xl overflow-hidden">
                <DiscoveryMap 
                  userLocation={userLocation} 
                  recommendedSpecialty={recommendedSpecialty} 
                  onBookDoctor={(doc) => {
                    setSelectedDoctorForBooking(doc);
                    setIsModalOpen(true);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating AI Chatbot */}
      <AIChatbot onRecommendation={setRecommendedSpecialty} />

      {/* Upload Medical Document Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md p-6 text-white shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/8 mb-5">
              <h3 className="text-lg font-bold">Upload to Medical Vault</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-gray-400 hover:text-white text-xl">&times;</button>
            </div>

            <form onSubmit={submitRecordUpload} className="space-y-4">
              {uploadMsg && (
                <div className="bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 p-3 rounded-xl text-xs font-medium text-center">
                  {uploadMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Document Title</label>
                <input
                  type="text" required value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  placeholder="e.g. Annual Blood Panel Report"
                  className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Record Category</label>
                <select
                  value={uploadData.recordType}
                  onChange={(e) => setUploadData({ ...uploadData, recordType: e.target.value })}
                  className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Lab Report" className="bg-[#111827]">🩸 Lab Report</option>
                  <option value="Prescription" className="bg-[#111827]">📝 Prescription</option>
                  <option value="Imaging / X-Ray" className="bg-[#111827]">🩻 Imaging / X-Ray</option>
                  <option value="Discharge Summary" className="bg-[#111827]">📑 Discharge Summary</option>
                  <option value="Other" className="bg-[#111827]">📄 Other Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Select File (PDF / Image)</label>
                <input
                  type="file" accept="image/*,.pdf" required onChange={handleFileUpload}
                  className="w-full bg-[#0d1117] border border-white/10 text-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Notes (Optional)</label>
                <input
                  type="text" value={uploadData.notes}
                  onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
                  placeholder="e.g. Fasting sugar result 95 mg/dL"
                  className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setIsUploadOpen(false)} className="flex-1 border border-white/15 hover:border-white/30 text-gray-300 py-2.5 rounded-xl text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={uploadLoading || !uploadData.fileUrl} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 disabled:opacity-50">
                  {uploadLoading ? 'Uploading...' : 'Save Record →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBooked={fetchAppointments}
        preselectedDoctor={selectedDoctorForBooking}
      />

      {/* Consultation Chat Modal */}
      <ConsultationChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        appointment={selectedChatAppointment}
      />

      {/* Log Vitals Modal */}
      {isVitalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative text-white">
            <div className="flex items-center justify-between mb-5 border-b border-white/8 pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>📊</span> Log Vital Measurement
              </h3>
              <button onClick={() => setIsVitalModalOpen(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>

            <form onSubmit={submitVital} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number" required value={vitalData.bloodPressureSystolic}
                    onChange={(e) => setVitalData({ ...vitalData, bloodPressureSystolic: e.target.value })}
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="120"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number" required value={vitalData.bloodPressureDiastolic}
                    onChange={(e) => setVitalData({ ...vitalData, bloodPressureDiastolic: e.target.value })}
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number" required value={vitalData.heartRate}
                    onChange={(e) => setVitalData({ ...vitalData, heartRate: e.target.value })}
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="72"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Fasting Glucose (mg/dL)</label>
                  <input
                    type="number" required value={vitalData.fastingGlucose}
                    onChange={(e) => setVitalData({ ...vitalData, fastingGlucose: e.target.value })}
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="95"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Body Weight (kg)</label>
                <input
                  type="number" step="any" required value={vitalData.weightKg}
                  onChange={(e) => setVitalData({ ...vitalData, weightKg: e.target.value })}
                  className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="68"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Measurement Context / Notes</label>
                <input
                  type="text" value={vitalData.notes}
                  onChange={(e) => setVitalData({ ...vitalData, notes: e.target.value })}
                  className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Morning pre-breakfast reading"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setIsVitalModalOpen(false)} className="flex-1 border border-white/15 hover:border-white/30 text-gray-300 py-2.5 rounded-xl text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={vitalLoading} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 disabled:opacity-50">
                  {vitalLoading ? 'Saving Log...' : 'Save Vitals →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
