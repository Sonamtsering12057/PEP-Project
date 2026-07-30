import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    welcome: "Welcome",
    dashboard: "Dashboard",
    overview: "Overview",
    appointments: "Appointments",
    findDoctors: "Find Doctors",
    medicalVault: "Medical Vault",
    vitalTrends: "Vital Trends",
    predictiveAI: "Predictive AI",
    healthAI: "Health Intelligence",
    signOut: "Sign Out",
    bookAppointment: "Book Appointment",
    consultationChat: "Consultation Chat",
    downloadRx: "Download Rx PDF",
    downloadReceipt: "Receipt",
    uploadDocument: "Upload Document",
    logVitals: "Log New Measurement",
    totalAppointments: "Total Appointments",
    activeDoctors: "Active Doctors Available",
    vaultDocuments: "Vault Documents",
    aiScans: "AI Health Scans Performed",
    searchDoctorsPlaceholder: "Search doctors by name or specialty...",
    aiSymptomChecker: "AI Symptom Assistant",
    aiGreeting: "Hello! I am your Wellness Connect AI Health Assistant. How can I help you today?"
  },
  hi: {
    welcome: "नमस्ते",
    dashboard: "डैशबोर्ड",
    overview: "अवलोकन",
    appointments: "अपॉइंटमेंट",
    findDoctors: "डॉक्टर खोजें",
    medicalVault: "मेडिकल वॉल्ट",
    vitalTrends: "वाइटल ट्रेंड्स",
    predictiveAI: "एआई भविष्यवाणी",
    healthAI: "स्वास्थ्य इंटेलिजेंस",
    signOut: "साइन आउट",
    bookAppointment: "अपॉइंटमेंट बुक करें",
    consultationChat: "परामर्श चैट",
    downloadRx: "प्रिस्क्रिप्शन डाउनलोड करें",
    downloadReceipt: "रसीद",
    uploadDocument: "दस्तावेज़ अपलोड करें",
    logVitals: "माप लॉग करें",
    totalAppointments: "कुल अपॉइंटमेंट",
    activeDoctors: "उपलब्ध डॉक्टर",
    vaultDocuments: "वॉल्ट दस्तावेज़",
    aiScans: "एआई स्कैन संपन्न",
    searchDoctorsPlaceholder: "नाम या विशेषज्ञता से खोजें...",
    aiSymptomChecker: "एआई लक्षण सहायक",
    aiGreeting: "नमस्ते! मैं आपका वेलनेस कनेक्ट एआई स्वास्थ्य सहायक हूं। मैं आपकी कैसे मदद कर सकता हूं?"
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
