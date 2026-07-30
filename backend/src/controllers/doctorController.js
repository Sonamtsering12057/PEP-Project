const User = require('../models/User');

// Helper to seed initial sample doctors & System Admin
const seedDoctorsIfEmpty = async () => {
  try {
    // Purge any legacy/invalid admin document and create clean System Admin
    await User.deleteOne({ email: 'admin@wellnessconnect.com' });
    await User.create({
      name: 'System Admin',
      email: 'admin@wellnessconnect.com',
      password: 'admin123',
      role: 'Admin'
    });
    console.log('✓ System Admin active: admin@wellnessconnect.com / admin123');

    const count = await User.countDocuments({ role: 'Doctor' });
    if (count < 10) {
      const sampleDoctors = [
        {
          name: 'Dr. John Test',
          email: 'john.test@wellnessconnect.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'General Physician',
            consultationFee: 500,
            clinicLocation: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'Connaught Place, New Delhi' },
            isVerified: true
          }
        },
        {
          name: 'Dr. Alice Smith',
          email: 'alice.smith@wellnessconnect.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'General Physician',
            consultationFee: 500,
            clinicLocation: { type: 'Point', coordinates: [77.2210, 28.6250], address: 'South Extension, New Delhi' },
            isVerified: true
          }
        },
        {
          name: 'Dr. Rajesh Sharma',
          email: 'rajesh.sharma@wellnessconnect.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'Cardiologist',
            consultationFee: 900,
            clinicLocation: { type: 'Point', coordinates: [77.2140, 28.6319], address: 'Max Heart & Vascular Institute, Delhi' },
            isVerified: true
          }
        },
        {
          name: 'Dr. Priya Patel',
          email: 'priya.patel@wellnessconnect.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'Dermatologist',
            consultationFee: 700,
            clinicLocation: { type: 'Point', coordinates: [77.1980, 28.5990], address: 'Skin & Laser Care Center, Green Park' },
            isVerified: true
          }
        },
        {
          name: 'Dr. Vikramaditya Singh',
          email: 'vikram.singh@wellnessconnect.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'Neurologist',
            consultationFee: 1200,
            clinicLocation: { type: 'Point', coordinates: [77.2050, 28.6410], address: 'Brain & Spine Institute, Karol Bagh' },
            isVerified: true
          }
        },
        {
          name: 'Dr. Ananya Roy',
          email: 'ananya.roy@wellnessconnect.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'Gastroenterologist',
            consultationFee: 850,
            clinicLocation: { type: 'Point', coordinates: [77.2340, 28.5850], address: 'Gastro & Liver Care Clinic, Lajpat Nagar' },
            isVerified: true
          }
        },
        {
          name: 'Dr. Gurpreet Kaur',
          email: 'gurpreet.kaur@wellnessconnect.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'Pulmonologist',
            consultationFee: 800,
            clinicLocation: { type: 'Point', coordinates: [77.1850, 28.6520], address: 'Pulmonary Respiratory Clinic, Rajendra Nagar' },
            isVerified: true
          }
        },
        {
          name: 'Dr. Suresh Menon',
          email: 'suresh.menon@wellnessconnect.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'Oncologist',
            consultationFee: 1500,
            clinicLocation: { type: 'Point', coordinates: [77.2450, 28.5680], address: 'Apollo Oncology Center, Sarita Vihar' },
            isVerified: true
          }
        },
        {
          name: 'Dr. Meenakshi Sundaram',
          email: 'meenakshi.s@wellnessconnect.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'Rheumatologist',
            consultationFee: 950,
            clinicLocation: { type: 'Point', coordinates: [77.1680, 28.6180], address: 'Joint & Arthritis Care Clinic, Patel Nagar' },
            isVerified: true
          }
        },
        {
          name: 'Dr. Arvind Kumar',
          email: 'arvind.kumar@wellnessconnect.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'Endocrinologist',
            consultationFee: 1000,
            clinicLocation: { type: 'Point', coordinates: [77.2180, 28.5520], address: 'Diabetes & Hormone Center, Saket' },
            isVerified: true
          }
        },
        {
          name: 'Dr. Sunita Kapoor',
          email: 'sunita.kapoor@wellnessconnect.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'Pediatrician',
            consultationFee: 600,
            clinicLocation: { type: 'Point', coordinates: [77.2280, 28.6380], address: 'Child Care & Health Center, Daryaganj' },
            isVerified: true
          }
        },
        {
          name: 'Dr. Harshvardhan Joshi',
          email: 'harsh.joshi@wellnessconnect.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'Orthopedic',
            consultationFee: 1100,
            clinicLocation: { type: 'Point', coordinates: [77.1950, 28.5720], address: 'Ortho & Bone Trauma Center, Hauz Khas' },
            isVerified: true
          }
        },
        {
          name: 'Dr. Neha Verma',
          email: 'neha.verma@wellnessconnect.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'Psychiatrist',
            consultationFee: 900,
            clinicLocation: { type: 'Point', coordinates: [77.1720, 28.6320], address: 'Mind Wellness Clinic, Pusa Road' },
            isVerified: true
          }
        },
        {
          name: 'Dr. Alok Verma',
          email: 'alok.verma@wellnessconnect.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'Ophthalmologist',
            consultationFee: 750,
            clinicLocation: { type: 'Point', coordinates: [77.2080, 28.5880], address: 'Advanced Eye Care Center, INA Market' },
            isVerified: true
          }
        }
      ];

      for (const docData of sampleDoctors) {
        const exists = await User.findOne({ email: docData.email });
        if (!exists) {
          await User.create(docData);
        }
      }
    }
  } catch (err) {
    console.error("Seeding error:", err);
  }
};

// GET /api/doctors - Search and filter doctors
const getDoctors = async (req, res) => {
  try {
    await seedDoctorsIfEmpty();

    const { name, specialty, isVerified } = req.query;
    let query = { role: 'Doctor' };

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (specialty) {
      query['doctorProfile.specialization'] = { $regex: specialty, $options: 'i' };
    }
    if (isVerified !== undefined) {
      query['doctorProfile.isVerified'] = isVerified === 'true';
    }

    const doctors = await User.find(query).select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/doctors/:id - Get specific doctor profile
const getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id).select('-password');
    if (!doctor || doctor.role !== 'Doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/doctors/me/profile - Update doctor's own profile
const updateMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id);
    if (!doctor || doctor.role !== 'Doctor') {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const { specialization, consultationFee, qualifications, experienceYears, bio, clinicAddress, coordinates } = req.body;

    if (!doctor.doctorProfile) doctor.doctorProfile = {};

    if (specialization) doctor.doctorProfile.specialization = specialization;
    if (consultationFee) doctor.doctorProfile.consultationFee = Number(consultationFee);
    if (qualifications) doctor.doctorProfile.qualifications = qualifications;
    if (experienceYears) doctor.doctorProfile.experienceYears = Number(experienceYears);
    if (bio) doctor.doctorProfile.bio = bio;

    if (clinicAddress || coordinates) {
      doctor.doctorProfile.clinicLocation = {
        type: 'Point',
        coordinates: coordinates || doctor.doctorProfile?.clinicLocation?.coordinates || [77.2090, 28.6139],
        address: clinicAddress || doctor.doctorProfile?.clinicLocation?.address || 'Medical Center'
      };
    }

    await doctor.save();
    res.json({ success: true, data: doctor, message: 'Doctor profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/doctors/admin/all - Get all doctors for admin verification queue
const getAllDoctorsForAdmin = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'Doctor' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH /api/doctors/admin/:id/verify - Admin toggle verification
const verifyDoctorByAdmin = async (req, res) => {
  try {
    const { isVerified } = req.body;
    const doctor = await User.findById(req.params.id);

    if (!doctor || doctor.role !== 'Doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (!doctor.doctorProfile) doctor.doctorProfile = {};
    doctor.doctorProfile.isVerified = isVerified;

    await doctor.save();
    res.json({ success: true, data: doctor, message: `Doctor verification status updated to ${isVerified}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  seedDoctorsIfEmpty,
  getDoctors,
  getDoctorById,
  updateMyDoctorProfile,
  getAllDoctorsForAdmin,
  verifyDoctorByAdmin
};
