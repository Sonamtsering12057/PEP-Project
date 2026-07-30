import React, { useState } from "react";
import axios from "axios";

const Message = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleMessage = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/messages', {
        firstName, lastName, email, phone, message
      });
      if (res.data.success) {
        alert("Message Sent successfully!");
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setMessage("");
      }
    } catch (error) {
      alert("Error sending message. Please try again later.");
    }
  };

  return (
    <div className="container form-component message-form mt-10">
      <form onSubmit={handleMessage} className="w-[50vw] mx-auto bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Contact Us</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="flex-1 p-3 border rounded-lg bg-gray-50 focus:outline-teal-500"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="flex-1 p-3 border rounded-lg bg-gray-50 focus:outline-teal-500"
          />
        </div>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 p-3 border rounded-lg bg-gray-50 focus:outline-teal-500"
          />
          <input
            type="number"
            placeholder="Mobile Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 p-3 border rounded-lg bg-gray-50 focus:outline-teal-500"
          />
        </div>
        <textarea
          rows={7}
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4 bg-gray-50 focus:outline-teal-500"
        />
        <div style={{ justifyContent: "center", alignItems: "center" }} className="flex">
          <button type="submit" className="bg-teal-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-teal-700">
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
};

export default Message;
