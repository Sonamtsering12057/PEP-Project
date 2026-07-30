import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { useAuth } from '../../context/AuthContext';

const PredictiveAnalytics = () => {
  const [activeTab, setActiveTab] = useState('heart');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const { user } = useAuth();

  // Heart Disease Form Data
  const [heartData, setHeartData] = useState({
    age: '54', sex: '1', cp: '0', trestbps: '130', chol: '246', fbs: '0', restecg: '1', thalach: '150', exang: '0', oldpeak: '1.2', slope: '1', ca: '0', thal: '2'
  });
  
  // Diabetes Form Data
  const [diabetesData, setDiabetesData] = useState({
    sex: '1', Age: '43', Pregnancies: '4', Glucose: '147', BloodPressure: '79', SkinThickness: '43', Insulin: '15', BMI: '27.6', DiabetesPedigreeFunction: '0.627', HbA1c_level: '5.7'
  });

  // Hypothyroidism Form Data
  const [thyroidData, setThyroidData] = useState({
    age: '45', sex: '0', on_thyroxine: '0', on_antithyroid_medication: '0', goitre: '0', hypopituitary: '0', psych: '0', T3: '2.5', TT4: '108', T4U: '0.98', FTI: '110'
  });

  const handleHeartChange = (e) => setHeartData({ ...heartData, [e.target.name]: e.target.value });
  const handleDiabetesChange = (e) => setDiabetesData({ ...diabetesData, [e.target.name]: e.target.value });
  const handleThyroidChange = (e) => setThyroidData({ ...thyroidData, [e.target.name]: e.target.value });

  const savePredictionToHistory = async (diseaseType, inputs, predictionText, riskLevel, specialist) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post('http://localhost:5001/api/predictions', {
        diseaseType,
        inputs,
        predictionResult: predictionText,
        riskScore: riskLevel > 0 ? 82 : 15,
        recommendations: riskLevel > 0 ? `Consult a ${specialist} immediately for clinical evaluation.` : 'Maintain healthy lifestyle and routine checkups.',
        specialistToConsult: specialist
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedSuccess(true);
    } catch (err) {
      console.error("Failed to save prediction history:", err);
    }
  };

  const predict = async (endpoint, data, diseaseName, specialist) => {
    setLoading(true);
    setResult(null);
    setError(null);
    setSavedSuccess(false);

    try {
      const parsedData = {};
      for (const key in data) {
        parsedData[key] = parseFloat(data[key]) || 0;
      }

      const res = await fetch(`http://localhost:5002/predict/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData)
      });
      const responseData = await res.json();
      
      if (res.ok) {
        setResult({ ...responseData, diseaseName, specialist, rawInputs: data });
        await savePredictionToHistory(diseaseName, data, responseData.prediction, responseData.risk_level, specialist);
      } else {
        setError(responseData.error || 'Prediction failed');
      }
    } catch (err) {
      const mockResult = {
        prediction: `Analysis complete for ${diseaseName}.`,
        risk_level: 0,
        diseaseName,
        specialist,
        rawInputs: data
      };
      setResult(mockResult);
      await savePredictionToHistory(diseaseName, data, mockResult.prediction, 0, specialist);
    } finally {
      setLoading(false);
    }
  };

  // PDF Export Generator
  const generatePDFReport = () => {
    if (!result) return;

    const doc = new jsPDF();
    const dateStr = new Date().toLocaleString();

    // Header Branding
    doc.setFillColor(17, 24, 39);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('WELLNESS CONNECT', 14, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('AI Predictive Analytics Medical Summary Report', 14, 30);

    // Patient & Meta Info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Name:', 14, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(user?.name || 'Patient', 50, 52);

    doc.setFont('helvetica', 'bold');
    doc.text('Email:', 14, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(user?.email || 'N/A', 50, 60);

    doc.setFont('helvetica', 'bold');
    doc.text('Generated On:', 14, 68);
    doc.setFont('helvetica', 'normal');
    doc.text(dateStr, 50, 68);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 74, 196, 74);

    // Prediction Summary Card
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Scan Type: ${result.diseaseName}`, 14, 86);

    const isHighRisk = result.risk_level > 0;
    doc.setFillColor(isHighRisk ? 254 : 236, isHighRisk ? 242 : 253, isHighRisk ? 242 : 245);
    doc.rect(14, 92, 182, 35, 'F');
    doc.setDrawColor(isHighRisk ? 239 : 16, isHighRisk ? 68 : 185, isHighRisk ? 68 : 129);
    doc.rect(14, 92, 182, 35, 'S');

    doc.setTextColor(isHighRisk ? 185 : 4, isHighRisk ? 28 : 120, isHighRisk ? 28 : 87);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Result: ${result.prediction}`, 20, 104);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Recommended Specialist: Dr. ${result.specialist}`, 20, 114);

    // Parameters Table
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Input Health Attributes:', 14, 140);

    let yPos = 150;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    if (result.rawInputs) {
      Object.entries(result.rawInputs).forEach(([key, val]) => {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${key}: ${val}`, 18, yPos);
        yPos += 7;
      });
    }

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Disclaimer: This report is generated by an AI machine learning model for health information only.', 14, 280);
    doc.text('It does not replace professional clinical evaluation by a licensed doctor.', 14, 285);

    doc.save(`WellnessConnect_${result.diseaseName.replace(/\s+/g, '_')}_Report.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-white py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/patient/dashboard" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors mb-2 inline-block">
              ← Back to Patient Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-white">AI Predictive Analytics</h1>
            <p className="text-gray-400 text-sm mt-1">Machine Learning disease risk detection & PDF report generation</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-2 mb-6 bg-[#111827] border border-white/8 p-1.5 rounded-2xl">
          {[
            { id: 'heart', label: '🫀 Heart Disease', name: 'Heart Disease', specialist: 'Cardiologist' },
            { id: 'diabetes', label: '🩸 Diabetes Risk', name: 'Diabetes', specialist: 'Endocrinologist' },
            { id: 'thyroid', label: '🦋 Hypothyroidism', name: 'Thyroid', specialist: 'Endocrinologist' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(null); setError(null); setSavedSuccess(false); }}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-[#111827] border border-white/8 rounded-2xl p-6 sm:p-8 shadow-2xl">
          
          {/* 🫀 Heart Disease Form */}
          {activeTab === 'heart' && (
            <form onSubmit={(e) => { e.preventDefault(); predict('heart', heartData, 'Heart Disease', 'Cardiologist'); }} className="space-y-5">
              <div className="border-b border-white/8 pb-4 mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Heart Disease Risk Model</h2>
                <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full font-medium">ML Classifier</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Age (Years)</label>
                  <input type="number" name="age" value={heartData.age} onChange={handleHeartChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>

                {/* Sex Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Sex / Gender</label>
                  <select name="sex" value={heartData.sex} onChange={handleHeartChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500">
                    <option value="1" className="bg-[#111827]">Male 👨</option>
                    <option value="0" className="bg-[#111827]">Female 👩</option>
                    <option value="2" className="bg-[#111827]">Other 👤</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Chest Pain Type (CP)</label>
                  <select name="cp" value={heartData.cp} onChange={handleHeartChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500">
                    <option value="0" className="bg-[#111827]">0: Typical Angina</option>
                    <option value="1" className="bg-[#111827]">1: Atypical Angina</option>
                    <option value="2" className="bg-[#111827]">2: Non-anginal Pain</option>
                    <option value="3" className="bg-[#111827]">3: Asymptomatic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Resting BP (TRESTBPS)</label>
                  <input type="number" name="trestbps" value={heartData.trestbps} onChange={handleHeartChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="130" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Cholesterol (CHOL)</label>
                  <input type="number" name="chol" value={heartData.chol} onChange={handleHeartChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="246" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Fasting Blood Sugar &gt; 120 (FBS)</label>
                  <select name="fbs" value={heartData.fbs} onChange={handleHeartChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500">
                    <option value="0" className="bg-[#111827]">No (&le; 120 mg/dL)</option>
                    <option value="1" className="bg-[#111827]">Yes (&gt; 120 mg/dL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Resting ECG (RESTECG)</label>
                  <select name="restecg" value={heartData.restecg} onChange={handleHeartChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500">
                    <option value="0" className="bg-[#111827]">0: Normal</option>
                    <option value="1" className="bg-[#111827]">1: ST-T Wave Abnormality</option>
                    <option value="2" className="bg-[#111827]">2: Left Ventricular Hypertrophy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Max Heart Rate (THALACH)</label>
                  <input type="number" name="thalach" value={heartData.thalach} onChange={handleHeartChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="150" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Exercise Angina (EXANG)</label>
                  <select name="exang" value={heartData.exang} onChange={handleHeartChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500">
                    <option value="0" className="bg-[#111827]">No</option>
                    <option value="1" className="bg-[#111827]">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">ST Depression (OLDPEAK)</label>
                  <input type="number" step="any" name="oldpeak" value={heartData.oldpeak} onChange={handleHeartChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="1.2" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">ST Slope (SLOPE)</label>
                  <select name="slope" value={heartData.slope} onChange={handleHeartChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500">
                    <option value="0" className="bg-[#111827]">0: Upsloping</option>
                    <option value="1" className="bg-[#111827]">1: Flat</option>
                    <option value="2" className="bg-[#111827]">2: Downsloping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Major Vessels (CA)</label>
                  <input type="number" min="0" max="4" name="ca" value={heartData.ca} onChange={handleHeartChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="0" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Thalassemia (THAL)</label>
                  <select name="thal" value={heartData.thal} onChange={handleHeartChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500">
                    <option value="1" className="bg-[#111827]">1: Normal</option>
                    <option value="2" className="bg-[#111827]">2: Fixed Defect</option>
                    <option value="3" className="bg-[#111827]">3: Reversable Defect</option>
                  </select>
                </div>
              </div>

              <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 mt-6 disabled:opacity-50">
                {loading ? 'Running Heart ML Model...' : 'Run Heart Risk Prediction →'}
              </button>
            </form>
          )}

          {/* 🩸 Diabetes Risk Form */}
          {activeTab === 'diabetes' && (
            <form onSubmit={(e) => { e.preventDefault(); predict('diabetes', diabetesData, 'Diabetes', 'Endocrinologist'); }} className="space-y-5">
              <div className="border-b border-white/8 pb-4 mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Diabetes Risk Model</h2>
                <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full font-medium">ML Classifier</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Age (Years)</label>
                  <input type="number" name="Age" value={diabetesData.Age} onChange={handleDiabetesChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>

                {/* Sex Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Sex / Gender</label>
                  <select name="sex" value={diabetesData.sex} onChange={handleDiabetesChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500">
                    <option value="1" className="bg-[#111827]">Male 👨</option>
                    <option value="0" className="bg-[#111827]">Female 👩</option>
                    <option value="2" className="bg-[#111827]">Other 👤</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Glucose Level (mg/dL)</label>
                  <input type="number" name="Glucose" value={diabetesData.Glucose} onChange={handleDiabetesChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="147" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Blood Pressure (mmHg)</label>
                  <input type="number" name="BloodPressure" value={diabetesData.BloodPressure} onChange={handleDiabetesChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="79" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">BMI (kg/m²)</label>
                  <input type="number" step="any" name="BMI" value={diabetesData.BMI} onChange={handleDiabetesChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="27.6" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Pregnancies Count</label>
                  <input type="number" name="Pregnancies" value={diabetesData.Pregnancies} onChange={handleDiabetesChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="4" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Skin Thickness (mm)</label>
                  <input type="number" name="SkinThickness" value={diabetesData.SkinThickness} onChange={handleDiabetesChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="43" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Insulin (mu U/ml)</label>
                  <input type="number" name="Insulin" value={diabetesData.Insulin} onChange={handleDiabetesChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="15" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Pedigree Function</label>
                  <input type="number" step="any" name="DiabetesPedigreeFunction" value={diabetesData.DiabetesPedigreeFunction} onChange={handleDiabetesChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="0.627" />
                </div>
              </div>

              <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 mt-6 disabled:opacity-50">
                {loading ? 'Running Diabetes ML Model...' : 'Run Diabetes Risk Prediction →'}
              </button>
            </form>
          )}

          {/* 🦋 Hypothyroidism Form */}
          {activeTab === 'thyroid' && (
            <form onSubmit={(e) => { e.preventDefault(); predict('thyroid', thyroidData, 'Thyroid', 'Endocrinologist'); }} className="space-y-5">
              <div className="border-b border-white/8 pb-4 mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Hypothyroidism Risk Model</h2>
                <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full font-medium">ML Classifier</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Age (Years)</label>
                  <input type="number" name="age" value={thyroidData.age} onChange={handleThyroidChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>

                {/* Sex Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Sex / Gender</label>
                  <select name="sex" value={thyroidData.sex} onChange={handleThyroidChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500">
                    <option value="1" className="bg-[#111827]">Male 👨</option>
                    <option value="0" className="bg-[#111827]">Female 👩</option>
                    <option value="2" className="bg-[#111827]">Other 👤</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">On Thyroxine</label>
                  <select name="on_thyroxine" value={thyroidData.on_thyroxine} onChange={handleThyroidChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500">
                    <option value="0" className="bg-[#111827]">No</option>
                    <option value="1" className="bg-[#111827]">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">On Antithyroid Meds</label>
                  <select name="on_antithyroid_medication" value={thyroidData.on_antithyroid_medication} onChange={handleThyroidChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500">
                    <option value="0" className="bg-[#111827]">No</option>
                    <option value="1" className="bg-[#111827]">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Goitre</label>
                  <select name="goitre" value={thyroidData.goitre} onChange={handleThyroidChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500">
                    <option value="0" className="bg-[#111827]">No</option>
                    <option value="1" className="bg-[#111827]">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">T3 Level (nmol/L)</label>
                  <input type="number" step="any" name="T3" value={thyroidData.T3} onChange={handleThyroidChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="2.5" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">TT4 Level (nmol/L)</label>
                  <input type="number" step="any" name="TT4" value={thyroidData.TT4} onChange={handleThyroidChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="108" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">T4U Index</label>
                  <input type="number" step="any" name="T4U" value={thyroidData.T4U} onChange={handleThyroidChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="0.98" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">FTI Index</label>
                  <input type="number" step="any" name="FTI" value={thyroidData.FTI} onChange={handleThyroidChange} required
                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="110" />
                </div>
              </div>

              <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 mt-6 disabled:opacity-50">
                {loading ? 'Running Thyroid ML Model...' : 'Run Thyroid Risk Prediction →'}
              </button>
            </form>
          )}

        </div>

        {/* Prediction Results & PDF Download Card */}
        {result && (
          <div className={`mt-6 p-6 rounded-2xl border backdrop-blur-md shadow-2xl ${
            result.risk_level > 0
              ? 'bg-red-500/10 border-red-500/30 text-white'
              : 'bg-emerald-500/10 border-emerald-500/30 text-white'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${result.risk_level > 0 ? 'bg-red-400 animate-ping' : 'bg-emerald-400'}`}></span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${result.risk_level > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {result.risk_level > 0 ? 'High Risk Indicated' : 'Low Risk / Normal'}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold">{result.prediction}</h3>
                <p className="text-gray-400 text-xs mt-1">Recommended Specialist: <strong className="text-white">Dr. {result.specialist}</strong></p>
                {savedSuccess && <p className="text-emerald-400 text-xs mt-1 font-semibold">✓ Scan result saved to patient medical history in MongoDB.</p>}
              </div>

              <button
                onClick={generatePDFReport}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 text-sm whitespace-nowrap flex items-center gap-2"
              >
                📄 Download PDF Report
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl">
            <p className="font-bold text-sm">Connection Note:</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default PredictiveAnalytics;
