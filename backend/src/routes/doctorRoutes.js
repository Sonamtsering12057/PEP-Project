const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  updateMyDoctorProfile,
  getAllDoctorsForAdmin,
  verifyDoctorByAdmin,
  getLiveNearbyHospitals
} = require('../controllers/doctorController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getDoctors);
router.get('/live-nearby-hospitals', getLiveNearbyHospitals);

// Doctor routes
router.get('/me/profile', protect, restrictTo('Doctor'), getDoctorById);
router.put('/me/profile', protect, restrictTo('Doctor'), updateMyDoctorProfile);

// Admin routes
router.get('/admin/all', protect, restrictTo('Admin'), getAllDoctorsForAdmin);
router.patch('/admin/:id/verify', protect, restrictTo('Admin'), verifyDoctorByAdmin);

// Generic ID route
router.get('/:id', getDoctorById);

module.exports = router;
