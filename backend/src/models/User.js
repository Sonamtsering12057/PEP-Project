const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorProfileSchema = new mongoose.Schema({
  specialization: { type: String, required: true },
  qualifications: [String],
  consultationFee: { type: Number, default: 0 },
  availability: [{
    dayOfWeek: { type: Number, min: 0, max: 6 }, // 0 = Sunday
    startTime: String, // '09:00'
    endTime: String, // '17:00'
  }],
  clinicLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }, // [longitude, latitude]
    address: String
  },
  isVerified: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Patient', 'Doctor', 'Admin'], default: 'Patient' },
  phone: { type: String },
  doctorProfile: { type: doctorProfileSchema, required: function() { return this.role === 'Doctor'; } }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
