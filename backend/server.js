require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');
const { seedDoctorsIfEmpty } = require('./src/controllers/doctorController');

// Connect to MongoDB and seed admin & initial doctors
connectDB().then(() => {
  seedDoctorsIfEmpty();
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Routes
const aiRoutes = require('./src/routes/aiRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const authRoutes = require('./src/routes/authRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const predictionRoutes = require('./src/routes/predictionRoutes');
const recordRoutes = require('./src/routes/recordRoutes');
const consultationRoutes = require('./src/routes/consultationRoutes');
const vitalRoutes = require('./src/routes/vitalRoutes');

app.use('/api/ai', aiRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/vitals', vitalRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Wellness Connect API is running');
});

// Socket.io connection & room join logic
io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);

  socket.on('join_appointment_room', (appointmentId) => {
    socket.join(`appointment_${appointmentId}`);
    console.log(`Socket ${socket.id} joined room appointment_${appointmentId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
