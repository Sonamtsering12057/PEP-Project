const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// POST /api/messages - Public endpoint to send a contact message
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;
    if (!firstName || !lastName || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const newMessage = await Message.create(req.body);
    res.status(201).json({ success: true, data: newMessage, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/messages - Admin only to view all messages
router.get('/', protect, restrictTo('Admin'), async (req, res) => {
  try {
    const messages = await Message.find().sort('-createdAt');
    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
