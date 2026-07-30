const { GoogleGenerativeAI } = require('@google/generative-ai');
const diseaseReference = require('../data/diseaseReference');

// ──────────────────────────────────────────────────────────────────
// Helper – Local smart symptom analysis when no Gemini key is set
// ──────────────────────────────────────────────────────────────────
function localAnalysis(symptoms) {
  const userSymptoms = symptoms.toLowerCase();

  let bestMatch = { condition: null, score: 0 };
  const lines = diseaseReference.split('\n');
  for (const line of lines) {
    if (line.startsWith('- ')) {
      const parts = line.substring(2).split(':');
      if (parts.length >= 2) {
        const condition = parts[0].trim();
        const symptomList = parts.slice(1).join(':').toLowerCase();
        const words = userSymptoms.split(/\W+/).filter(w => w.length > 3);
        let score = 0;
        for (const word of words) {
          if (symptomList.includes(word)) score++;
        }
        if (score > bestMatch.score) bestMatch = { condition, score };
      }
    }
  }

  const conditionName = bestMatch.score > 0
    ? bestMatch.condition
    : 'a general viral or bacterial infection';

  let specialty = 'General Physician';
  const c = conditionName.toLowerCase();
  if (c.includes('heart') || c.includes('cardio') || c.includes('artery') || c.includes('stroke') || c.includes('atrial')) specialty = 'Cardiologist';
  else if (c.includes('skin') || c.includes('acne') || c.includes('eczema') || c.includes('psoriasis') || c.includes('melanoma')) specialty = 'Dermatologist';
  else if (c.includes('brain') || c.includes('neuro') || c.includes('migraine') || c.includes('alzheimer') || c.includes('epilep') || c.includes('parkinson')) specialty = 'Neurologist';
  else if (c.includes('stomach') || c.includes('bowel') || c.includes('liver') || c.includes('ulcer') || c.includes('gastro') || c.includes('hepatitis') || c.includes('gallstone')) specialty = 'Gastroenterologist';
  else if (c.includes('lung') || c.includes('asthma') || c.includes('copd') || c.includes('pneumonia') || c.includes('pulmonary')) specialty = 'Pulmonologist';
  else if (c.includes('cancer') || c.includes('leukaemia') || c.includes('lymphoma') || c.includes('tumour')) specialty = 'Oncologist';
  else if (c.includes('arthritis') || c.includes('gout') || c.includes('lupus') || c.includes('rheum')) specialty = 'Rheumatologist';
  else if (c.includes('depress') || c.includes('anxiety') || c.includes('schizophrenia') || c.includes('bipolar') || c.includes('adhd') || c.includes('ptsd') || c.includes('panic')) specialty = 'Psychiatrist';
  else if (c.includes('eye') || c.includes('vision')) specialty = 'Ophthalmologist';
  else if (c.includes('kidney') || c.includes('urin')) specialty = 'Nephrologist/Urologist';
  else if (c.includes('diabetes') || c.includes('thyroid') || c.includes('hormonal') || c.includes('pcos')) specialty = 'Endocrinologist';

  return { conditionName, specialty };
}

// ──────────────────────────────────────────────────────────────────
// Helper – Local smart health correlation analysis (Labs + Wearables + Symptoms)
// ──────────────────────────────────────────────────────────────────
function localHealthCorrelation(labs = {}, wearables = {}, symptoms = '') {
  const signals = [];
  const sym = (symptoms || '').toLowerCase();

  const hb = parseFloat(labs.hemoglobin || 13.5);
  const iron = parseFloat(labs.iron || 90);
  const ldl = parseFloat(labs.ldl || 110);
  const sleep = parseFloat(wearables.sleep || 7);
  const hrv = parseFloat(wearables.hrv || 50);
  const stress = parseFloat(wearables.stress || 40);

  // Signal 1: Anemia / Iron Correlation
  if (hb < 12.0 || iron < 65 || sym.includes('headache') || sym.includes('fatigue') || sym.includes('tired')) {
    signals.push({
      type: hb < 11.0 ? 'Red' : 'Yellow',
      title: hb < 11.0 ? 'Microcytic Anemia Alert' : 'Subclinical Iron Deficiency Risk',
      description: `Hemoglobin level (${hb} g/dL) and Serum Iron (${iron} µg/dL) indicate potential oxygen transport deficit. ${sym ? `Reported symptoms (${sym}) strongly correlate with cerebral hypoxia.` : ''}`,
      correlation: `Lab: Hemoglobin (${hb} g/dL) + Iron (${iron} µg/dL) ↔ Symptoms: "${symptoms || 'Fatigue'}"`
    });
  } else {
    signals.push({
      type: 'Green',
      title: 'Hematologic Stability',
      description: `Hemoglobin (${hb} g/dL) and Serum Iron (${iron} µg/dL) are within optimal physiological parameters.`,
      correlation: `Lab: Hemoglobin (${hb} g/dL) ↔ Normal Biomarkers`
    });
  }

  // Signal 2: Autonomic Stress & Sleep Recovery Correlation
  if (sleep < 6.5 || stress > 65 || hrv < 45) {
    signals.push({
      type: stress > 75 || sleep < 5.5 ? 'Red' : 'Yellow',
      title: 'Elevated Sympathetic Stress & Sleep Deficit',
      description: `Sleep duration (${sleep} hrs) combined with HRV (${hrv} ms) and Stress Index (${stress}/100) shows impaired autonomic nervous system recovery.`,
      correlation: `Wearables: Sleep (${sleep}h) + Stress Index (${stress}/100) ↔ Reduced Parasympathetic Tone`
    });
  } else {
    signals.push({
      type: 'Green',
      title: 'Optimal Circadian Recovery',
      description: `Sleep duration (${sleep} hrs) and Heart Rate Variability (${hrv} ms) reflect robust cardiovascular recovery.`,
      correlation: `Wearables: Sleep (${sleep}h) + HRV (${hrv}ms) ↔ Balance`
    });
  }

  // Signal 3: Lipid & Vascular Risk Correlation
  if (ldl > 130) {
    signals.push({
      type: ldl > 160 ? 'Red' : 'Yellow',
      title: 'Atherogenic Lipid Burden',
      description: `LDL Cholesterol level of ${ldl} mg/dL is elevated above normal threshold (100 mg/dL), increasing atheromatous plaque risk.`,
      correlation: `Lab: LDL (${ldl} mg/dL) ↔ Vascular Health Indicator`
    });
  } else {
    signals.push({
      type: 'Green',
      title: 'Healthy Lipid Profile',
      description: `LDL Cholesterol (${ldl} mg/dL) is well within normal protective limits.`,
      correlation: `Lab: LDL (${ldl} mg/dL) ↔ Normal Lipid Panel`
    });
  }

  return signals;
}

// ──────────────────────────────────────────────────────────────────
// POST /api/ai/chat – main conversational endpoint
// ──────────────────────────────────────────────────────────────────
const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const hasApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here' && process.env.GEMINI_API_KEY.length > 10;

    if (hasApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: `You are Wellness AI, a compassionate expert medical assistant built into Wellness Connect platform.\n\nDISEASE REFERENCE:\n${diseaseReference}\n\nProvide actionable, empathetic health guidance with disclaimers.`
        });

        const geminiHistory = history.map(m => ({
          role: m.role === 'ai' ? 'model' : 'user',
          parts: [{ text: m.text }]
        }));

        const chatSession = model.startChat({ history: geminiHistory });
        const result = await chatSession.sendMessage(message);
        const responseText = result.response.text();

        return res.json({ reply: responseText });
      } catch (err) {
        console.warn("Gemini API call failed, falling back to smart local engine:", err.message);
      }
    }

    // Smart Local Fallback
    const { conditionName, specialty } = localAnalysis(message);

    const lines = [];
    lines.push(`Based on your reported symptoms, this sounds like it could be **${conditionName}**.`);
    lines.push('');
    lines.push(`### What this might mean:`);

    const refLines = diseaseReference.split('\n');
    for (const line of refLines) {
      if (line.startsWith('- ') && line.toLowerCase().includes(conditionName.toLowerCase().split(' ')[0])) {
        const parts = line.substring(2).split(':');
        if (parts.length >= 2) {
          lines.push(`Common symptoms include: *${parts.slice(1).join(':').trim()}*`);
        }
        break;
      }
    }

    lines.push('');
    lines.push(`### Recommended Action:`);
    lines.push(`- Consult a **${specialty}** as soon as possible.`);
    lines.push(`- Monitor your symptoms and note any changes.`);
    lines.push(`- Stay hydrated and rest while you seek professional care.`);
    lines.push('');
    lines.push(`---`);
    lines.push(`> ⚠️ **Disclaimer:** I am an AI assistant, not a licensed doctor. This is not a medical diagnosis. Please consult a qualified healthcare professional for proper evaluation.`);

    return res.json({
      reply: lines.join('\n'),
      recommendedSpecialty: specialty
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ message: error.message || 'Failed to get AI response' });
  }
};

// ──────────────────────────────────────────────────────────────────
// POST /api/ai/triage
// ──────────────────────────────────────────────────────────────────
const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;
    const hasApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here' && process.env.GEMINI_API_KEY.length > 10;

    if (!hasApiKey) {
      const { conditionName, specialty } = localAnalysis(symptoms);
      return res.json({
        likelyCondition: conditionName,
        recommendedSpecialty: specialty,
        disclaimer: 'I am an AI health assistant. Please consult a doctor for medical advice.'
      });
    }

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are an expert medical triage AI. Reference:\n${diseaseReference}\nUser symptoms: "${symptoms}"\nRespond ONLY with raw JSON:\n{\n  "likelyCondition": "String",\n  "recommendedSpecialty": "String",\n  "disclaimer": "I am an AI assistant, not a doctor."\n}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '').trim();
      return res.json(JSON.parse(text));
    } catch (err) {
      const { conditionName, specialty } = localAnalysis(symptoms);
      return res.json({
        likelyCondition: conditionName,
        recommendedSpecialty: specialty,
        disclaimer: 'I am an AI health assistant. Please consult a doctor for medical advice.'
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to analyze symptoms' });
  }
};

// ──────────────────────────────────────────────────────────────────
// POST /api/ai/health-analysis – lab/wearable correlation
// ──────────────────────────────────────────────────────────────────
const analyzeHealthData = async (req, res) => {
  try {
    const { labs = {}, wearables = {}, symptoms = '' } = req.body;
    const hasApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here' && process.env.GEMINI_API_KEY.length > 10;

    if (hasApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are an expert medical correlation AI.\nLab Reports: ${JSON.stringify(labs)}\nWearables: ${JSON.stringify(wearables)}\nSymptoms: ${symptoms || 'None'}\n\nGenerate 3 health signals. Respond ONLY with raw JSON:\n{\n  "signals": [\n    { "type": "Red|Yellow|Green", "title": "Short title", "description": "Detailed explanation", "correlation": "Data relationship" }\n  ]\n}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(text);
        parsedData.disclaimer = 'This analysis is AI-generated. It is not a medical diagnosis.';
        return res.json(parsedData);
      } catch (err) {
        console.warn("Gemini API health analysis failed, using local correlation engine:", err.message);
      }
    }

    // Local Smart Health Correlation Engine
    const signals = localHealthCorrelation(labs, wearables, symptoms);
    return res.json({
      signals,
      disclaimer: 'AI Health Intelligence Analysis complete.'
    });

  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to analyze health data' });
  }
};

module.exports = { analyzeSymptoms, analyzeHealthData, chat };
