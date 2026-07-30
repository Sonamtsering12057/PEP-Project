import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AIChatbot from '../../components/AIChatbot';
import LanguageSelector from '../../components/LanguageSelector';

// ──────────────────────────────────────────────
// Navbar
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/5 shadow-xl' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="text-white font-bold text-lg">Wellness Connect</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {[['Features', 'features'], ['How It Works', 'how-it-works'], ['Platforms', 'platforms'], ['Contact', 'contact']].map(([label, id]) => (
            <button key={id} onClick={() => scrollTo(id)} className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
              {label}
            </button>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSelector />
          {user ? (
            <>
              <Link to={user.role === 'Doctor' ? '/doctor' : user.role === 'Admin' ? '/admin' : '/patient/dashboard'}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2">
                Dashboard
              </Link>
              <button onClick={logout} className="text-sm font-medium text-gray-300 hover:text-white border border-white/20 px-4 py-2 rounded-lg transition-all hover:border-white/40">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white border border-white/20 px-4 py-2 rounded-lg transition-all hover:border-white/40">
                Sign In
              </Link>
              <Link to="/register" className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-600/30">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="space-y-1.5">
            <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-opacity ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-black/95 border-t border-white/10 px-6 py-4 space-y-4">
          {[['Features', 'features'], ['How It Works', 'how-it-works'], ['Platforms', 'platforms'], ['Contact', 'contact']].map(([label, id]) => (
            <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left text-gray-300 hover:text-white py-2 text-sm">
              {label}
            </button>
          ))}
          <div className="flex gap-3 pt-2">
            <Link to="/login" className="flex-1 text-center text-sm text-gray-300 border border-white/20 px-4 py-2 rounded-lg">Sign In</Link>
            <Link to="/register" className="flex-1 text-center text-sm text-white bg-blue-600 px-4 py-2 rounded-lg">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

// ──────────────────────────────────────────────
// Section Components
// ──────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-[#111827] border border-white/8 rounded-2xl p-6 hover:border-blue-500/30 hover:bg-[#1a2030] transition-all duration-300 group">
    <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-600/30 transition-colors">
      <span className="text-2xl">{icon}</span>
    </div>
    <h3 className="text-white font-bold text-lg mb-3">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const StepCard = ({ num, title, desc }) => (
  <div className="flex flex-col items-start">
    <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-600/40">
      <span className="text-white font-bold text-lg">{String(num).padStart(2, '0')}</span>
    </div>
    <h3 className="text-white font-bold text-lg mb-3">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const TestimonialCard = ({ text, name, role, initials, featured }) => (
  <div className={`bg-[#111827] border rounded-2xl p-6 ${featured ? 'border-blue-500/50' : 'border-white/8'}`}>
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => <span key={i} className="text-blue-500">★</span>)}
    </div>
    <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">"{text}"</p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-sm">{initials}</span>
      </div>
      <div>
        <p className="text-white font-semibold text-sm">{name}</p>
        <p className="text-gray-500 text-xs">{role}</p>
      </div>
    </div>
  </div>
);

// ──────────────────────────────────────────────
// Main Home Page
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

  const features = [
    { icon: '🧠', title: 'AI Symptom Triage', desc: "Describe your symptoms and get instant AI-powered recommendations for the right specialist." },
    { icon: '📍', title: 'Real-time Doctor Discovery', desc: "Find nearby available doctors on an interactive map, sorted by distance and availability." },
    { icon: '⏰', title: 'Instant Booking', desc: "Book appointments in seconds with real-time slot availability and instant confirmation." },
    { icon: '🛡️', title: 'Verified Doctors', desc: "Every doctor on our platform is verified with credentials, reviews, and availability data." },
    { icon: '📚', title: 'Health Library', desc: "Access a curated library of trusted health articles, guides, and AI-driven insights." },
    { icon: '⚡', title: 'Secure Payments', desc: "Pay securely online with encrypted payment processing and instant digital receipts." },
  ];

  const steps = [
    { num: 1, title: 'Describe Your Symptoms', desc: "Chat with our AI health assistant and describe what you're experiencing. Get instant, intelligent recommendations." },
    { num: 2, title: 'Get AI Recommendation', desc: "Our AI analyzes your symptoms and recommends the right specialist and nearby doctors." },
    { num: 3, title: 'Find Nearby Doctors', desc: "View available doctors on an interactive map. Filter by specialty, rating, fee, and availability." },
    { num: 4, title: 'Book & Confirm', desc: "Select a time slot, complete payment, and get instant confirmation with directions to the clinic." },
  ];

  const testimonials = [
    { text: "Wellness Connect made finding a cardiologist so easy. The AI told me exactly what I needed, and I had an appointment within 2 hours.", name: "Sarah Johnson", role: "Patient", initials: "SJ" },
    { text: "As a doctor, I appreciate the verified professional network and the way this platform respects our control over scheduling and pricing.", name: "Dr. Rajesh Kumar", role: "Cardiologist", initials: "RK", featured: true },
    { text: "The real-time map view showing nearby doctors was a game-changer. No more calling multiple clinics!", name: "Michael Chen", role: "Patient", initials: "MC" },
    { text: "Using both sides of the platform, I can say Wellness Connect truly bridges the gap between patients and doctors.", name: "Dr. Priya Sharma", role: "General Physician", initials: "PS" },
  ];

  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      <Navbar />

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <span>✦</span>
            <span>AI-Powered Healthcare Access</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            Find the Right Doctor,{' '}
            <span className="text-blue-500">Fast</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Get AI-powered symptom guidance, discover nearby doctors in real-time,
            and book appointments instantly. All in one platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={handleGetStarted}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/40 hover:shadow-blue-500/50 hover:scale-105"
            >
              Start Now <span>→</span>
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/15 hover:border-white/30 transition-all hover:bg-white/5"
            >
              Watch Demo
            </button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[['🧬', 'AI Symptom Check'], ['📍', 'Real-time Location'], ['⚡', 'Instant Booking']].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 text-sm px-4 py-2 rounded-full hover:bg-white/8 transition-colors">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/40 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5">
              Everything You Need to{' '}
              <span className="text-blue-500">Find Care</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Wellness Connect combines AI, location technology, and doctor networks to make healthcare access simple.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-[#0d1117]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5">How It Works</h2>
            <p className="text-gray-400 text-lg">A seamless journey from symptom to consultation in just four simple steps.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {steps.map((s, i) => (
              <div key={s.num} className="flex flex-col">
                <StepCard {...s} />
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute mt-7 ml-14 w-full h-0.5 bg-gradient-to-r from-blue-600/30 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5">Trusted by Thousands</h2>
            <p className="text-gray-400 text-lg">Hear from patients and doctors who've transformed their healthcare experience.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => <TestimonialCard key={t.name} {...t} />)}
          </div>
        </div>
      </section>

      {/* ── Platforms Section ── */}
      <section id="platforms" className="py-24 px-6 bg-[#0d1117]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5">Built for Everyone</h2>
            <p className="text-gray-400 text-lg">Three dedicated portals designed for patients, doctors, and administrators.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Patient Portal */}
            <div className="bg-[#111827] border border-white/8 rounded-2xl p-7 hover:border-blue-500/30 transition-all">
              <div className="w-14 h-14 bg-blue-600/20 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="text-white font-bold text-xl mb-3">Patient Portal</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">Browse health information, chat with AI, discover doctors, and book appointments.</p>
              <ul className="space-y-3 mb-8">
                {['AI Symptom Assistant', 'Real-time Doctor Discovery', 'Secure Booking', 'Appointment History', 'Health Analytics'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>{f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block text-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all text-sm">
                Get Started →
              </Link>
            </div>

            {/* Doctor Portal */}
            <div className="bg-[#111827] border border-white/8 rounded-2xl p-7 hover:border-blue-500/30 transition-all">
              <div className="w-14 h-14 bg-blue-600/20 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">🩺</span>
              </div>
              <h3 className="text-white font-bold text-xl mb-3">Doctor Portal</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">Manage your practice, set availability, accept appointments, and track earnings.</p>
              <ul className="space-y-3 mb-8">
                {['Profile Management', 'Availability Scheduling', 'Appointment Management', 'Earnings Tracking', 'Patient History'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>{f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block text-center border border-white/20 hover:border-blue-500/50 hover:bg-blue-500/10 text-white font-semibold py-3 rounded-xl transition-all text-sm">
                Join as Doctor →
              </Link>
            </div>

            {/* Admin Portal */}
            <div className="bg-[#111827] border border-white/8 rounded-2xl p-7 hover:border-blue-500/30 transition-all">
              <div className="w-14 h-14 bg-blue-600/20 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-white font-bold text-xl mb-3">Admin Portal</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">Verify doctors, manage content, monitor payments, and oversee platform operations.</p>
              <ul className="space-y-3 mb-8">
                {['Doctor Verification', 'Content Management', 'Payment Monitoring', 'Analytics Dashboard', 'User Management'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>{f}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="block text-center border border-white/20 hover:border-blue-500/50 hover:bg-blue-500/10 text-white font-semibold py-3 rounded-xl transition-all text-sm">
                Admin Login →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/10 border border-blue-500/20 rounded-3xl p-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5">
              Ready to Find Your Doctor?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of patients who've discovered a smarter way to access healthcare.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-600/40 hover:scale-105"
              >
                Start for Free →
              </button>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact / Footer ── */}
      <footer id="contact" className="bg-[#0d1117] border-t border-white/8 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <span className="text-white font-bold">Wellness Connect</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">AI-powered healthcare access. Find the right doctor, fast.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Platform</h4>
              <ul className="space-y-2">
                {['Features', 'How It Works', 'Pricing', 'Security'].map(l => (
                  <li key={l}><span className="text-gray-500 text-sm hover:text-gray-300 cursor-pointer transition-colors">{l}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2">
                {['About Us', 'Blog', 'Careers', 'Press'].map(l => (
                  <li key={l}><span className="text-gray-500 text-sm hover:text-gray-300 cursor-pointer transition-colors">{l}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>📧 hello@wellnessconnect.ai</li>
                <li>📞 +91 7037585448</li>
                <li>📍 Phagwara, Punjab, India</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">© 2026 Wellness Connect. All rights reserved.</p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                <span key={l} className="text-gray-600 text-sm hover:text-gray-400 cursor-pointer transition-colors">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating AI Chatbot */}
      <AIChatbot />
    </div>
  );
};

export default Home;
