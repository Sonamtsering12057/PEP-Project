import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';

const ConsultationChatModal = ({ isOpen, onClose, appointment }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let pollingInterval = null;

    if (isOpen && appointment) {
      fetchMessages();

      // Socket setup with fallback URL
      try {
        const socketUrl = API_BASE || window.location.origin;
        socketRef.current = io(socketUrl, { transports: ['websocket', 'polling'] });
        socketRef.current.emit('join_appointment_room', appointment._id);

        socketRef.current.on('new_consultation_message', (newMsg) => {
          setMessages((prev) => {
            if (prev.some(m => m._id === newMsg._id)) return prev;
            return [...prev, newMsg];
          });
        });
      } catch (e) {
        console.warn("Socket connection warning:", e.message);
      }

      // Polling fallback every 3s
      pollingInterval = setInterval(() => {
        fetchMessages();
      }, 3000);

      return () => {
        if (pollingInterval) clearInterval(pollingInterval);
        socketRef.current?.disconnect();
      };
    }
  }, [isOpen, appointment]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!appointment?._id) return;
    try {
      const res = await axios.get(`${API_BASE}/api/consultations/appointment/${appointment._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(res.data.data || []);
    } catch (err) {
      console.error("Error fetching consultation messages:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !appointment) return;

    const messageText = inputMessage;
    setInputMessage('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/consultations/send`, {
        appointmentId: appointment._id,
        message: messageText
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.data.success && res.data.data) {
        setMessages((prev) => [...prev, res.data.data]);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !appointment) return null;

  const doctorName = appointment.doctor?.name || 'Doctor';
  const patientName = appointment.patient?.name || 'Patient';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full h-[600px] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-lg">
              💬
            </div>
            <div>
              <h3 className="font-extrabold text-base">Live Consultation Chat</h3>
              <p className="text-gray-300 text-xs">
                {user?.role === 'Doctor' ? `Patient: ${patientName}` : `Doctor: Dr. ${doctorName}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white font-bold p-1 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm font-medium">
              💬 No messages yet. Send a message to start the consultation!
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
              return (
                <div key={msg._id || idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                  }`}>
                    <p className="font-semibold text-[11px] opacity-80 mb-0.5">{msg.senderName || (isMine ? 'You' : 'Other')}</p>
                    <p>{msg.message}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your clinical message..."
            className="flex-1 bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 text-sm"
          >
            Send →
          </button>
        </form>

      </div>
    </div>
  );
};

export default ConsultationChatModal;
