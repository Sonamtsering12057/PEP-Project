import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector = () => {
  const { lang, setLang } = useLanguage();

  return (
    <div className="relative inline-block">
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="bg-[#111827] border border-white/15 text-white text-xs font-semibold rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-blue-500 transition-all hover:bg-white/5"
      >
        <option value="en" className="bg-[#111827]">🌐 English</option>
        <option value="hi" className="bg-[#111827]">🌐 Hindi (हिंदी)</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
