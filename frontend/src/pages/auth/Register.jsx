import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'Patient' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    const result = await register(formData.name, formData.email, formData.password, formData.role);
    if (result.success) {
      if (formData.role === 'Doctor') navigate('/doctor');
      else if (formData.role === 'Admin') navigate('/admin');
      else navigate('/patient/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080b12] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <span className="text-white font-bold text-xl">Wellness Connect</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white mb-2">Create your account</h1>
          <p className="text-gray-400">Join thousands finding better healthcare</p>
        </div>

        {/* Card */}
        <div className="bg-[#111827] border border-white/8 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                name="name" required value={formData.name} onChange={handleChange}
                placeholder="Your full name"
                className="w-full bg-[#0d1117] border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                name="email" type="email" required value={formData.email} onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-[#0d1117] border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">I am a...</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'Patient', icon: '👤 Patient' },
                  { role: 'Doctor', icon: '🩺 Doctor' },
                  { role: 'Admin', icon: '👑 Admin' }
                ].map(r => (
                  <button
                    key={r.role} type="button"
                    onClick={() => setFormData({ ...formData, role: r.role })}
                    className={`py-3 px-3 rounded-xl text-xs font-medium border transition-all ${
                      formData.role === r.role
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-white/3 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {r.icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                name="password" type="password" required value={formData.password} onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full bg-[#0d1117] border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <input
                name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange}
                placeholder="Repeat your password"
                className="w-full bg-[#0d1117] border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          <Link to="/" className="hover:text-gray-400 transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
