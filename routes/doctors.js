const express = require('express');
const { body, validationResult } = require('express-validator');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();


router.post('/profile', [auth, authorize('doctor')], [
  body('specialization').notEmpty().withMessage('Specialization is required'),
  body('qualification').notEmpty().withMessage('Qualification is required'),
  body('experience').isNumeric().withMessage('Experience must be a number'),
  body('licenseNumber').notEmpty().withMessage('License number is required'),
  body('consultationFee').isNumeric().withMessage('Consultation fee must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if doctor profile already exists
    const existingDoctor = await Doctor.findOne({ user: req.user._id });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor profile already exists' });
    }

    const {
      specialization,
      qualification,
      experience,
      licenseNumber,
      consultationFee,
      availability,
      hospital,
      bio
    } = req.body;

    const doctor = new Doctor({
      user: req.user._id,
      specialization,
      qualification,
      experience,
      licenseNumber,
      consultationFee,
      availability,
      hospital,
      bio
    });

    await doctor.save();

    res.status(201).json({
      message: 'Doctor profile created successfully',
      doctor
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'License number already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { specialization, page = 1, limit = 10, search } = req.query;
    
    const query = {};
    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }

    let doctors = await Doctor.find(query)
      .populate('user', 'name email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1 });

    // Filter by search term if provided
    if (search) {
      doctors = doctors.filter(doctor => 
        doctor.user.name.toLowerCase().includes(search.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await Doctor.countDocuments(query);

    res.json({
      doctors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email phone');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/profile', [auth, authorize('doctor')], async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const {
      specialization,
      qualification,
      experience,
      consultationFee,
      availability,
      hospital,
      bio
    } = req.body;

    // Update fields
    if (specialization) doctor.specialization = specialization;
    if (qualification) doctor.qualification = qualification;
    if (experience) doctor.experience = experience;
    if (consultationFee) doctor.consultationFee = consultationFee;
    if (availability) doctor.availability = availability;
    if (hospital) doctor.hospital = hospital;
    if (bio) doctor.bio = bio;

    await doctor.save();

    res.json({
      message: 'Doctor profile updated successfully',
      doctor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/availability', [auth, authorize('doctor')], async (req, res) => {
  try {
    const { availability } = req.body;
    
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    doctor.availability = availability;
    await doctor.save();

    res.json({
      message: 'Availability updated successfully',
      availability: doctor.availability
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/meta/specializations', async (req, res) => {
  try {
    const specializations = await Doctor.distinct('specialization');
    res.json(specializations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;