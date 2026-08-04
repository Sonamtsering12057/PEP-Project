import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import PatientDashboard from './pages/patient/Dashboard';
import HealthIntelligence from './pages/patient/HealthIntelligence';
import PredictiveAnalytics from './pages/patient/PredictiveAnalytics';
import Home from './pages/public/Home';
import DoctorDashboard from './pages/doctor/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Medical3DBackground from './components/Medical3DBackground';

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <div className="fixed inset-0 z-0">
            <Medical3DBackground />
          </div>
          <div className="relative z-10">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Public Routes */}
              <Route path="/" element={<Home />} />

              {/* Patient Routes (Protected for Patient/Admin) */}
              <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['Patient', 'Admin']}><PatientDashboard /></ProtectedRoute>} />
              <Route path="/intelligence" element={<ProtectedRoute allowedRoles={['Patient', 'Admin']}><HealthIntelligence /></ProtectedRoute>} />
              <Route path="/predict" element={<ProtectedRoute allowedRoles={['Patient', 'Admin']}><PredictiveAnalytics /></ProtectedRoute>} />
              
              {/* Doctor Routes (Protected for Doctor/Admin) */}
              <Route path="/doctor/*" element={<ProtectedRoute allowedRoles={['Doctor', 'Admin']}><DoctorDashboard /></ProtectedRoute>} />
              
              {/* Admin Routes (Protected for Admin only) */}
              <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
            </Routes>
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
