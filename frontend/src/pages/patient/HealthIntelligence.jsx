import React, { useState } from 'react';
import axios from 'axios';
import GlassCard from '../../components/GlassCard';

const HealthIntelligence = () => {
  const [formData, setFormData] = useState({
    hgb: '', iron: '', ldl: '',
    sleep: '', hrv: '', stress: '',
    symptoms: ''
  });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        labs: {
          hgb: parseFloat(formData.hgb),
          iron: parseFloat(formData.iron),
          ldl: parseFloat(formData.ldl)
        },
        wearables: {
          sleep: parseFloat(formData.sleep),
          hrv: parseFloat(formData.hrv),
          stress: parseFloat(formData.stress)
        },
        symptoms: formData.symptoms
      };

      const res = await axios.post('http://localhost:5001/api/ai/health-analysis', payload);
      setAnalysis(res.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching analysis. Make sure the backend is running.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 font-sans tracking-tight">Health Intelligence</h1>
        <p className="text-gray-500 mt-2">AI-driven correlation of your lab results, wearables, and symptoms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4 text-teal-800 border-b pb-2">Lab Reports</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hemoglobin (g/dL)</label>
                  <input type="number" step="0.1" name="hgb" value={formData.hgb} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 bg-gray-50 border" placeholder="e.g. 14.2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Iron (µg/dL)</label>
                  <input type="number" name="iron" value={formData.iron} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 bg-gray-50 border" placeholder="e.g. 80" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">LDL (mg/dL)</label>
                  <input type="number" name="ldl" value={formData.ldl} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 bg-gray-50 border" placeholder="e.g. 110" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 text-teal-800 border-b pb-2">Wearable Data</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sleep (hrs)</label>
                  <input type="number" step="0.1" name="sleep" value={formData.sleep} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 bg-gray-50 border" placeholder="e.g. 7.5" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">HRV (ms)</label>
                  <input type="number" name="hrv" value={formData.hrv} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 bg-gray-50 border" placeholder="e.g. 45" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stress Score (1-100)</label>
                  <input type="number" name="stress" value={formData.stress} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 bg-gray-50 border" placeholder="e.g. 60" required />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 text-teal-800 border-b pb-2">Symptoms</h2>
              <textarea name="symptoms" value={formData.symptoms} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 bg-gray-50 border" placeholder="Describe how you are feeling (e.g. fatigue, breathlessness, brain fog)..." required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center py-3">
              {loading ? 'Analyzing...' : 'Analyze Health Profile'}
            </button>
            <p className="text-xs text-center text-gray-400 mt-2">Privacy Note: This data is securely sent to AI for real-time analysis and is not persisted in any database.</p>
          </form>
        </GlassCard>

        {/* Results View */}
        <div className="space-y-6">
          {analysis ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Correlation Results</h2>
              {analysis.signals.map((signal, idx) => {
                let cardColor = "bg-white border-gray-200";
                let iconColor = "text-gray-500";
                
                if (signal.type === 'Red') {
                  cardColor = "bg-red-50 border-red-200 shadow-red-100";
                  iconColor = "text-red-600 bg-red-100";
                } else if (signal.type === 'Yellow') {
                  cardColor = "bg-yellow-50 border-yellow-200 shadow-yellow-100";
                  iconColor = "text-yellow-600 bg-yellow-100";
                } else if (signal.type === 'Green') {
                  cardColor = "bg-green-50 border-green-200 shadow-green-100";
                  iconColor = "text-green-600 bg-green-100";
                }

                return (
                  <div key={idx} className={`p-6 rounded-xl border ${cardColor} shadow-md transition-all hover:scale-[1.01]`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-3 h-3 rounded-full ${signal.type === 'Red' ? 'bg-red-500 animate-pulse' : signal.type === 'Yellow' ? 'bg-yellow-400' : 'bg-green-500'}`}></div>
                      <h3 className="text-lg font-bold">{signal.title}</h3>
                    </div>
                    <p className="text-gray-700 mb-4">{signal.description}</p>
                    
                    <div className="mt-4 p-3 bg-white/50 rounded-lg border border-white">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Explainable AI Correlation</p>
                      <p className="text-sm font-medium text-gray-800 font-mono">{signal.correlation}</p>
                    </div>
                  </div>
                );
              })}
              <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded-lg text-center mt-4 border border-gray-200">
                {analysis.disclaimer}
              </div>
            </>
          ) : (
             <div className="h-full border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-12 text-center text-gray-400 bg-slate-50/50">
               <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
               <p className="text-lg font-medium text-gray-500 mb-2">No Data Analyzed Yet</p>
               <p className="text-sm max-w-sm">Enter your lab results, wearable metrics, and symptoms on the left to see explainable AI correlations.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthIntelligence;
