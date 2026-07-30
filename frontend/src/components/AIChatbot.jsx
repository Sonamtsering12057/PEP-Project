import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Trash2, X, Bot } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const AIChatbot = ({ onRecommendation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      text: "👋 Hi! I'm **Wellness AI**, your personal health assistant.\n\nDescribe your symptoms in detail and I'll help identify possible conditions and recommend the right specialist to see.\n\n*Try something like: \"I have a fever, headache and sore throat for 3 days\"*" 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    const userMsg = { role: 'user', text: userText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Send full conversation history for context
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      
      const res = await axios.post('http://localhost:5001/api/ai/chat', {
        message: userText,
        history
      });

      const aiReply = res.data.reply;
      setMessages(prev => [...prev, { role: 'ai', text: aiReply }]);

      // Extract specialty for map filtering if detected
      if (res.data.recommendedSpecialty && onRecommendation) {
        onRecommendation(res.data.recommendedSpecialty);
      } else if (aiReply && onRecommendation) {
        // Try to extract from text
        const specialties = ['Cardiologist', 'Dermatologist', 'Neurologist', 'Gastroenterologist', 
          'Pulmonologist', 'Oncologist', 'Rheumatologist', 'Psychiatrist', 'Ophthalmologist',
          'Nephrologist', 'Endocrinologist', 'General Physician', 'Urologist'];
        for (const sp of specialties) {
          if (aiReply.includes(sp)) {
            onRecommendation(sp);
            break;
          }
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
        "I'm having trouble connecting right now. Please make sure the backend server is running on port 5001.";
      setMessages(prev => [...prev, { role: 'ai', text: `⚠️ ${errorMsg}` }]);
    }
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([{ 
      role: 'ai', 
      text: "👋 Hi! I'm **Wellness AI**, your personal health assistant.\n\nDescribe your symptoms in detail and I'll help identify possible conditions and recommend the right specialist to see.\n\n*Try something like: \"I have a fever, headache and sore throat for 3 days\"*"
    }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="absolute bottom-20 right-0 w-[360px] sm:w-[420px] h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
            style={{ boxShadow: '0 20px 60px -10px rgba(0,0,0,0.25)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-700 to-teal-500 text-white p-4 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bot size={22} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-teal-600 animate-pulse"></span>
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight">Wellness AI</p>
                  <p className="text-xs text-teal-100 leading-tight">Medical Assistant · Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={clearChat} 
                  title="Clear Chat" 
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Trash2 size={15} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-gray-50/80 scroll-smooth">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                      <Bot size={12} className="text-teal-700" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'ai'
                        ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                        : 'bg-teal-600 text-white rounded-tr-sm shadow-sm'
                    }`}
                  >
                    {msg.role === 'ai' ? (
                      <div className="prose prose-sm prose-teal max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({children}) => <p className="mb-1 last:mb-0">{children}</p>,
                          ul: ({children}) => <ul className="list-disc pl-4 my-1">{children}</ul>,
                          li: ({children}) => <li className="mb-0.5">{children}</li>,
                          strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                          blockquote: ({children}) => <blockquote className="border-l-2 border-teal-400 pl-2 text-gray-600 my-1">{children}</blockquote>,
                          h3: ({children}) => <h3 className="font-bold text-gray-900 mt-2 mb-1 text-sm">{children}</h3>,
                          hr: () => <hr className="my-2 border-gray-100" />,
                          em: ({children}) => <em className="text-gray-500 text-xs">{children}</em>,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Bot size={12} className="text-teal-700" />
                  </div>
                  <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            {messages.length === 1 && (
              <div className="px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0 bg-white border-t border-gray-100">
                {['I have a headache and fever', 'My chest hurts', 'I feel anxious and tired'].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                    className="text-xs bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-teal-100 transition-colors flex-shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
              <div className="flex gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Describe your symptoms..."
                  className="flex-1 px-3 py-2 bg-transparent border-none focus:outline-none text-sm text-gray-800 placeholder-gray-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-400 mt-1.5">Not a substitute for professional medical advice</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white p-4 rounded-full shadow-lg shadow-teal-600/40 flex items-center justify-center relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={22} />
            </motion.span>
          )}
        </AnimatePresence>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </motion.button>
    </div>
  );
};

export default AIChatbot;
