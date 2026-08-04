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
    <div className="min-h-screen bg-slate-50/70 backdrop-blur-sm flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white font-black text-lg">W</span>
            </div>
            <span className="text-gray-900 font-extrabold text-xl">Wellness Connect</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600 text-sm font-medium">Join thousands finding better healthcare</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                name="name" required value={formData.name} onChange={handleChange}
                placeholder="Your full name"
                className="w-full bg-slate-50 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                name="email" type="email" required value={formData.email} onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-slate-50 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">I am a...</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'Patient', icon: '👤 Patient' },
                  { role: 'Doctor', icon: '🩺 Doctor' },
                  { role: 'Admin', icon: '👑 Admin' }
                ].map(r => (
                  <button
                    key={r.role} type="button"
                    onClick={() => setFormData({ ...formData, role: r.role })}
                    className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all ${
                      formData.role === r.role
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'bg-slate-50 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {r.icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                name="password" type="password" required value={formData.password} onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full bg-slate-50 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <input
                name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange}
                placeholder="Repeat your password"
                className="w-full bg-slate-50 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20 mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6 font-medium">
          <Link to="/" className="hover:text-gray-800 transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
