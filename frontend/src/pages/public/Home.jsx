import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AIChatbot from '../../components/AIChatbot';
import LanguageSelector from '../../components/LanguageSelector';

// ──────────────────────────────────────────────
// Top Doctors Header Navbar
// ──────────────────────────────────────────────
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#080b12]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        
        {/* Top Doctors Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-lg">W</span>
          </div>
          <div>
            <span className="text-white font-extrabold text-xl tracking-tight block">Wellness Connect</span>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block -mt-1">Top Doctors Network</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            ['Top Doctors Directory', 'directory'],
            ['3D Route Discovery', 'map-discovery'],
            ['Specialties', 'specialties'],
            ['Portals', 'platforms'],
            ['Contact', 'contact']
          ].map(([label, id]) => (
            <button key={id} onClick={() => scrollTo(id)} className="text-gray-300 hover:text-white text-sm font-semibold transition-colors">
              {label}
            </button>
          ))}
        </div>

        {/* Auth & Language Switches */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSelector />
          {user ? (
            <>
              <Link to={user.role === 'Doctor' ? '/doctor' : user.role === 'Admin' ? '/admin' : '/patient/dashboard'}
                className="text-sm font-semibold text-white bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600/30 px-4 py-2 rounded-xl transition-all">
                Dashboard →
              </Link>
              <button onClick={logout} className="text-sm font-semibold text-gray-300 hover:text-white border border-white/15 px-4 py-2 rounded-xl transition-all hover:border-white/30">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-gray-300 hover:text-white border border-white/15 px-4 py-2 rounded-xl transition-all hover:border-white/30">
                Sign In
              </Link>
              <Link to="/register" className="text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-5 py-2 rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:scale-105">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="space-y-1.5">
            <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-opacity ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden bg-[#080b12] border-b border-white/10 px-6 py-5 space-y-4">
          {[
            ['Top Doctors Directory', 'directory'],
            ['3D Route Discovery', 'map-discovery'],
            ['Specialties', 'specialties'],
            ['Portals', 'platforms'],
            ['Contact', 'contact']
          ].map(([label, id]) => (
            <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left text-gray-300 hover:text-white py-2 text-sm font-medium">
              {label}
            </button>
          ))}
          <div className="flex gap-3 pt-2">
            <Link to="/login" className="flex-1 text-center text-sm text-gray-300 border border-white/20 px-4 py-2.5 rounded-xl">Sign In</Link>
            <Link to="/register" className="flex-1 text-center text-sm text-white bg-blue-600 px-4 py-2.5 rounded-xl">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

// ──────────────────────────────────────────────
// Top Doctors Feature Components
// ──────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc, badge }) => (
  <div className="bg-[#0f172a]/70 border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-[#1e293b]/70 transition-all duration-300 group shadow-xl relative overflow-hidden">
    {badge && (
      <span className="absolute top-4 right-4 text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">
        {badge}
      </span>
    )}
    <div className="w-13 h-13 bg-gradient-to-tr from-blue-600/20 to-cyan-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
      <span className="text-3xl">{icon}</span>
    </div>
    <h3 className="text-white font-bold text-lg mb-3">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const StepCard = ({ num, title, desc }) => (
  <div className="flex flex-col items-start bg-[#0f172a]/50 border border-white/8 rounded-2xl p-6 relative hover:border-cyan-500/30 transition-all">
    <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-blue-600/30">
      <span className="text-white font-black text-base">{String(num).padStart(2, '0')}</span>
    </div>
    <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const SpecialtyPill = ({ icon, name, count, onClick }) => (
  <div onClick={onClick} className="bg-[#111827] border border-white/10 hover:border-blue-500/50 hover:bg-blue-600/10 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all hover:scale-105 group">
    <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
      {icon}
    </div>
    <div>
      <h4 className="text-white font-bold text-sm leading-snug">{name}</h4>
      <p className="text-blue-400 text-xs mt-0.5">{count} Specialists</p>
    </div>
  </div>
);

// ──────────────────────────────────────────────
// Main Home Page Component
// ──────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate(user.role === 'Doctor' ? '/doctor' : user.role === 'Admin' ? '/admin' : '/patient/dashboard');
    } else {
      navigate('/register');
    }
  };

  const topSpecialties = [
    { icon: '🫀', name: 'Cardiology', count: '48+' },
    { icon: '🩺', name: 'General Medicine', count: '120+' },
    { icon: '🩸', name: 'Dermatology', count: '65+' },
    { icon: '🧠', name: 'Neurology', count: '32+' },
    { icon: '🧪', name: 'Gastroenterology', count: '40+' },
    { icon: '🫁', name: 'Pulmonology', count: '28+' },
    { icon: '🦴', name: 'Orthopedics', count: '55+' },
    { icon: '👂', name: 'ENT Specialist', count: '35+' },
  ];

  const features = [
    { icon: '🏙️', title: '3D Maplibre Vector Discovery', desc: "Find top medical specialists on interactive 3D extruded maps with real-time polyline navigation and drive-time calculations.", badge: '3D Maps' },
    { icon: '🩺', title: 'Apollo & Verified Specialist Network', desc: "Search top-rated medical practitioners filtered by qualifications (MBBS, MD, DNB), clinical experience, and city location.", badge: 'Top Rated' },
    { icon: '🧠', title: 'AI Symptom & Clinical Correlation', desc: "Intelligent triage correlating patient symptoms, lab reports, and wearable vitals to recommend the ideal specialist instantly.", badge: 'AI Engine' },
    { icon: '💬', title: 'Socket.io Live Tele-Consultation', desc: "Real-time encrypted WebSocket consultation rooms between patients and doctors with zero page reload latencies.", badge: 'Real-Time' },
    { icon: '📑', title: 'Digital Prescription PDF Engine', desc: "Doctors generate official digital Rx reports and itemized fee receipts downloadable in PDF format.", badge: 'PDF Exports' },
    { icon: '📊', title: 'Vital Biometric Trend Tracker', desc: "Monitor daily Blood Pressure, Fasting Glucose, Heart Rate, and Weight with clinical status indicators.", badge: 'Biometrics' },
  ];

  const steps = [
    { num: 1, title: 'Search Specialist or Symptoms', desc: "Enter your symptoms or search top doctors by specialty, qualification, or city location." },
    { num: 2, title: 'Locate via 3D Map Route', desc: "View doctors on an interactive 3D map with real-time driving directions and distance calculations." },
    { num: 3, title: 'Book Consultation', desc: "Select an available slot, confirm appointment details, and receive instant booking confirmation." },
    { num: 4, title: 'Connect & Receive Rx', desc: "Join the live consultation chat room, receive professional medical guidance, and download your digital prescription." },
  ];

  return (
    <div className="min-h-screen bg-[#080b12] text-white selection:bg-blue-500 selection:text-white">
      <Navbar />

      {/* ── Top Doctors Hero Section ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
        
        {/* Glowing Background Radial Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[140px]"></div>
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          
          {/* Top Doctors Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 border border-blue-500/30 text-cyan-300 text-xs font-extrabold uppercase tracking-widest px-4 py-2 rounded-full mb-8 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Top Doctors Medical Platform · Powered by 3D Vector Maps & AI</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight mb-8">
            Find Top Doctors.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Book Instantly.
            </span>
          </h1>

          <p className="text-gray-300 text-lg md:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Discover verified top specialists, navigate with 3D real-time route directions, and receive AI health intelligence — all in one global medical platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-base px-9 py-4 rounded-xl transition-all shadow-xl shadow-blue-600/30 hover:scale-105"
            >
              Find Doctors Now <span className="text-lg">→</span>
            </button>
            <button
              onClick={() => document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-white font-semibold text-base px-8 py-4 rounded-xl border border-white/20 hover:border-cyan-400/50 hover:bg-white/5 transition-all"
            >
              <span>🏙️</span> Explore 3D Map Directory
            </button>
          </div>

          {/* Platform Performance Telemetry Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-white/10">
            {[
              { label: 'Search Speed Boost', val: '170%', sub: 'Optimized 3D Engine' },
              { label: 'Verified Specialists', val: '500+', sub: 'Apollo & Network Doctors' },
              { label: 'Real-Time Directions', val: '3D Maps', sub: 'Drive Time & Route Line' },
              { label: 'Patient Satisfaction', val: '99.2%', sub: 'Top Rated Consultations' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0f172a]/60 border border-white/8 rounded-2xl p-4 text-center">
                <p className="text-2xl md:text-3xl font-black text-cyan-400">{stat.val}</p>
                <p className="text-white font-bold text-xs mt-1">{stat.label}</p>
                <p className="text-gray-400 text-[11px] mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Browse Top Specialties Section ── */}
      <section id="specialties" className="py-20 px-6 bg-[#0b0f19]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full">Medical Categories</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 mb-4">Browse Top Medical Specialties</h2>
            <p className="text-gray-400 text-base max-w-2xl mx-auto">Find leading practitioners across major medical disciplines verified for excellence.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {topSpecialties.map((sp) => (
              <SpecialtyPill
                key={sp.name}
                {...sp}
                onClick={() => {
                  handleGetStarted();
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Doctors Features Grid ── */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">Platform Architecture</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-4 mb-4">Engineered for Medical Excellence</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Combining Google Cloud & 3D Spatial Technology with AI health intelligence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works Step Guide ── */}
      <section id="how-it-works" className="py-24 px-6 bg-[#0b0f19]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">Frictionless Workflow</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-4 mb-4">How Top Doctors Works</h2>
            <p className="text-gray-400 text-lg">From symptom inquiry to 3D route navigation and prescription in 4 simple steps.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <StepCard key={s.num} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Platforms Section (Patient / Doctor / Admin) ── */}
      <section id="platforms" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full">Role Command Centers</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-4 mb-4">Dedicated Portals for Every User</h2>
            <p className="text-gray-400 text-lg">Tailored interfaces built specifically for Patients, Doctors, and Administrators.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Patient Portal */}
            <div className="bg-[#0f172a]/70 border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-3xl">👤</span>
                </div>
                <h3 className="text-white font-bold text-2xl mb-3">Patient Portal</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">Search top doctors, track 3D route directions, book instant consultations, and manage digital health records.</p>
                <ul className="space-y-3 mb-8">
                  {['AI Clinical Symptom Assistant', '3D Vector Doctor Discovery Map', 'Socket.io Real-Time Tele-Chat', 'Downloadable Prescription PDFs', 'Biometric Vitals Tracker'].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-gray-300 text-sm">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>{f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/register" className="block text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 text-sm">
                Access Patient Portal →
              </Link>
            </div>

            {/* Doctor Portal */}
            <div className="bg-[#0f172a]/70 border border-white/10 rounded-2xl p-8 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-3xl">🩺</span>
                </div>
                <h3 className="text-white font-bold text-2xl mb-3">Doctor Portal</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">Manage clinical practice, set availability slots, conduct virtual consultations, and issue digital prescriptions.</p>
                <ul className="space-y-3 mb-8">
                  {['Verified Doctor Profile System', 'Availability & Slot Management', 'Interactive Patient Tele-Chat', 'Digital Rx PDF Generator', 'Earnings & Analytics Overview'].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-gray-300 text-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>{f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/register" className="block text-center border border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-300 font-bold py-3.5 rounded-xl transition-all text-sm">
                Join as Medical Doctor →
              </Link>
            </div>

            {/* Admin Portal */}
            <div className="bg-[#0f172a]/70 border border-white/10 rounded-2xl p-8 hover:border-amber-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-amber-600/20 border border-amber-500/30 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-3xl">👑</span>
                </div>
                <h3 className="text-white font-bold text-2xl mb-3">Admin Command Center</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">Oversee platform operations, verify practitioner credentials, monitor platform analytics, and manage contact queries.</p>
                <ul className="space-y-3 mb-8">
                  {['Doctor Verification Queue', 'License & Approval Controls', 'Real-time System Metrics', 'User Role Management', 'Contact Inquiry Management'].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-gray-300 text-sm">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>{f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/login" className="block text-center border border-amber-500/40 hover:bg-amber-500/10 text-amber-300 font-bold py-3.5 rounded-xl transition-all text-sm">
                Admin Portal Login →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── Footer Contact Section ── */}
      <footer id="contact" className="border-t border-white/10 bg-[#080b12] py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">W</div>
              <span className="text-white font-bold text-lg">Wellness Connect</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">Top Doctors Global Medical Network. AI-powered healthcare access and 3D doctor discovery.</p>
            <p className="text-gray-500 text-xs">© 2026 Wellness Connect. All rights reserved.</p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Home</button></li>
              <li><button onClick={() => scrollTo('specialties')} className="hover:text-white transition-colors">Top Specialties</button></li>
              <li><button onClick={() => scrollTo('how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
              <li><button onClick={() => scrollTo('platforms')} className="hover:text-white transition-colors">Portals</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">Medical Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><span>3D Map Location Discovery</span></li>
              <li><span>AI Symptom Triage</span></li>
              <li><span>Socket.io Consultation Chat</span></li>
              <li><span>Digital Prescription PDF</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">Contact Information</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li className="flex items-center gap-2">📧 <span>hello@wellnessconnect.ai</span></li>
              <li className="flex items-center gap-2">📞 <span>+91 7037585448</span></li>
              <li className="flex items-center gap-2">📍 <span>Phagwara, Punjab, India</span></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Floating AI Chatbot */}
      <AIChatbot />
    </div>
  );
};

export default Home;
