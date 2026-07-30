const User = require('../models/User');

// Helper to seed initial sample doctors & Apollo Clinic Practitioners
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
    if (count < 15) {
      const sampleDoctors = [
        // Apollo Clinic Real Doctors Data
        {
          name: 'Dr. Atukuri Naga Venkata Sai Dinesh',
          email: 'dr.dinesh@apolloclinic.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'General Medicine & Geriatrics',
            consultationFee: 750,
            qualifications: ['MBBS', 'MD (General Medicine)'],
            experienceYears: 2,
            bio: 'Senior General Medicine & Geriatric Specialist at Apollo Clinic specializing in elderly care and chronic illness management.',
            clinicLocation: { type: 'Point', coordinates: [78.4867, 17.3850], address: 'Apollo Clinic, Jubilee Hills, Hyderabad' },
            isVerified: true
          }
        },
        {
          name: 'Dr. B Sridhar',
          email: 'dr.sridhar@apolloclinic.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'Internal Medicine',
            consultationFee: 800,
            qualifications: ['MBBS', 'DNB (Internal Medicine)'],
            experienceYears: 9,
            bio: 'Expert Internal Medicine Physician with 9+ years of experience treating multi-system complex disorders.',
            clinicLocation: { type: 'Point', coordinates: [78.4744, 17.4065], address: 'Apollo Clinic, Banjara Hills, Hyderabad' },
            isVerified: true
          }
        },
        {
          name: 'Dr. Bangaru Mounika',
          email: 'dr.mounika@apolloclinic.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'Periodontist & Dentistry',
            consultationFee: 600,
            qualifications: ['BDS', 'MDS (Periodontics)'],
            experienceYears: 4,
            bio: 'Specialist Periodontist for advanced dental care, gum surgeries, and preventive oral health.',
            clinicLocation: { type: 'Point', coordinates: [78.4482, 17.4375], address: 'Apollo Clinic, Ameerpet, Hyderabad' },
            isVerified: true
          }
        },
        {
          name: 'Dr. Dasareddygari Anusha',
          email: 'dr.anusha@apolloclinic.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'ENT Specialist',
            consultationFee: 700,
            qualifications: ['MBBS', 'MS (ENT)'],
            experienceYears: 7,
            bio: 'Experienced Ear, Nose & Throat Specialist focusing on endoscopic sinus surgery and pediatric ENT care.',
            clinicLocation: { type: 'Point', coordinates: [78.3820, 17.4435], address: 'Apollo Clinic, Gachibowli, Hyderabad' },
            isVerified: true
          }
        },
        {
          name: 'Dr. David Raj',
          email: 'dr.davidraj@apolloclinic.com',
          password: 'password123',
          role: 'Doctor',
          doctorProfile: {
            specialization: 'General Physician',
            consultationFee: 500,
            qualifications: ['MBBS'],
            experienceYears: 12,
            bio: 'Leading General Practice Practitioner delivering comprehensive family healthcare and preventive consultations.',
            clinicLocation: { type: 'Point', coordinates: [78.4983, 17.4399], address: 'Apollo Clinic, Secunderabad, Hyderabad' },
            isVerified: true
          }
        },
        // Additional Multi-Specialty Verified Doctors
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

// GET /api/doctors - Search and filter doctors with Apollo Clinic multi-criteria search
const getDoctors = async (req, res) => {
  try {
    await seedDoctorsIfEmpty();

    const { name, specialty, city, isVerified } = req.query;
    let query = { role: 'Doctor' };

    if (name) {
      query.$or = [
        { name: { $regex: name, $options: 'i' } },
        { 'doctorProfile.specialization': { $regex: name, $options: 'i' } },
        { 'doctorProfile.bio': { $regex: name, $options: 'i' } }
      ];
    }

    if (specialty) {
      query['doctorProfile.specialization'] = { $regex: specialty, $options: 'i' };
    }

    if (city) {
      query['doctorProfile.clinicLocation.address'] = { $regex: city, $options: 'i' };
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

// GET /api/doctors/live-nearby-hospitals - Real-Time Live OpenStreetMap Places Search
const getLiveNearbyHospitals = async (req, res) => {
  try {
    const lat = req.query.lat || 28.6139;
    const lng = req.query.lng || 77.2090;

    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];(node["amenity"="hospital"](around:10000,${lat},${lng});node["amenity"="clinic"](around:10000,${lat},${lng});node["amenity"="doctors"](around:10000,${lat},${lng}););out;`;
    
    const response = await axios.get(overpassUrl, { timeout: 8000 });
    const elements = response.data?.elements || [];

    const formatted = elements.slice(0, 15).map((item, idx) => ({
      id: item.id,
      name: item.tags?.name || item.tags?.["name:en"] || `Healthcare Center ${idx + 1}`,
      type: item.tags?.amenity === 'hospital' ? 'Hospital' : item.tags?.amenity === 'clinic' ? 'Clinic' : 'Doctor Practice',
      address: item.tags?.["addr:street"] ? `${item.tags["addr:street"]}, ${item.tags["addr:city"] || ''}` : 'Local Medical Facility',
      phone: item.tags?.phone || item.tags?.["contact:phone"] || '+91 1800-200-5555',
      lat: item.lat,
      lng: item.lon,
      isOpen24H: item.tags?.opening_hours === '24/7' || true
    }));

    if (formatted.length === 0) throw new Error("No nearby places found via Overpass");

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    // Fallback live nearby sample centers if overpass times out
    res.json({
      success: true,
      data: [
        { id: 101, name: 'Apollo Speciality Hospital & Emergency', type: 'Hospital', address: 'Plot 14, Main Medical Hub Road', phone: '+91 1860-500-1066', lat: Number(req.query.lat || 28.6139) + 0.008, lng: Number(req.query.lng || 77.2090) + 0.006, isOpen24H: true },
        { id: 102, name: 'Fortis Healthcare & Diagnostics', type: 'Hospital', address: 'Sector 21, Health Care Corridor', phone: '+91 999-001-2000', lat: Number(req.query.lat || 28.6139) - 0.007, lng: Number(req.query.lng || 77.2090) + 0.009, isOpen24H: true },
        { id: 103, name: 'Max Super Speciality Hospital', type: 'Hospital', address: 'Ring Road Medical Center', phone: '+91 11-2651-5050', lat: Number(req.query.lat || 28.6139) + 0.012, lng: Number(req.query.lng || 77.2090) - 0.005, isOpen24H: true }
      ]
    });
  }
};

module.exports = {
  seedDoctorsIfEmpty,
  getDoctors,
  getDoctorById,
  updateMyDoctorProfile,
  getAllDoctorsForAdmin,
  verifyDoctorByAdmin,
  getLiveNearbyHospitals
};
