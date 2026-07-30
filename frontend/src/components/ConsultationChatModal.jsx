import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

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
    if (isOpen && appointment) {
      fetchMessages();

      // Socket setup
      socketRef.current = io('http://localhost:5001');
      socketRef.current.emit('join_appointment_room', appointment._id);

      socketRef.current.on('new_consultation_message', (newMsg) => {
        setMessages((prev) => [...prev, newMsg]);
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [isOpen, appointment]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/consultations/appointment/${appointment._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(res.data.data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    setLoading(true);
    try {
      await axios.post('http://localhost:5001/api/consultations/send', {
        appointmentId: appointment._id,
        message: inputMessage.trim()
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setInputMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !appointment) return null;

  const otherPersonName = user?.role === 'Doctor' ? appointment.patient?.name : appointment.doctor?.name;
  const otherPersonRole = user?.role === 'Doctor' ? 'Patient' : 'Doctor';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative text-white flex flex-col h-[600px]">
        
        {/* Header */}
        <div className="p-5 border-b border-white/8 bg-[#0d1117] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400 font-bold">
              {otherPersonName?.[0] || 'C'}
            </div>
            <div>
              <h3 className="text-base font-bold">Direct Consultation: {otherPersonName}</h3>
              <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Socket.io Encrypted Session · {otherPersonRole}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-light w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
            &times;
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-[#080b12]/50">
          {messages.length === 0 ? (
            <div className="text-center py-20 text-gray-500 text-xs">
              <p className="text-2xl mb-2">💬</p>
              <p>No messages yet. Send a message to start your consultation.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender?._id === user?._id || msg.senderRole === user?.role;
              return (
                <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20'
                      : 'bg-[#1e293b] border border-white/8 text-gray-200 rounded-bl-none'
                  }`}>
                    <p className="font-semibold mb-1 text-[10px] text-white/70">
                      {isMe ? 'You' : msg.sender?.name || msg.senderRole}
                    </p>
                    <p>{msg.message}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form */}
        <form onSubmit={sendMessage} className="p-4 border-t border-white/8 bg-[#0d1117] flex gap-2 flex-shrink-0">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your medical query or notes..."
            className="flex-1 bg-[#111827] border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-5 py-3 rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
          >
            Send →
          </button>
        </form>

      </div>
    </div>
  );
};

export default ConsultationChatModal;
