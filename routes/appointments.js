const express = require('express');
const moment = require('moment');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();
router.post('/', [auth, authorize('patient')], [
  body('doctor').notEmpty().withMessage('Doctor ID is required'),
  body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
  body('appointmentTime').notEmpty().withMessage('Appointment time is required'),
  body('reason').notEmpty().withMessage('Reason for appointment is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { doctor, appointmentDate, appointmentTime, reason, duration } = req.body;

    // Check if doctor exists
    const doctorInfo = await Doctor.findById(doctor);
    if (!doctorInfo) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if appointment date is in the future
    const appointmentDateTime = moment(`${appointmentDate} ${appointmentTime}`);
    if (appointmentDateTime.isBefore(moment())) {
      return res.status(400).json({ message: 'Appointment date must be in the future' });
    }

    // Check if the time slot is available
    const existingAppointment = await Appointment.findOne({
      doctor,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Create new appointment
    const appointment = new Appointment({
      patient: req.user._id,
      doctor,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      reason,
      duration: duration || 30,
      fee: doctorInfo.consultationFee
    });

    await appointment.save();

    // Populate the appointment with doctor and patient details
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor', 'specialization consultationFee')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .populate('patient', 'name email phone');

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date } = req.query;
    
    let query = {};
    
    // Filter based on user role
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctorInfo = await Doctor.findOne({ user: req.user._id });
      if (!doctorInfo) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      query.doctor = doctorInfo._id;
    }
    // Admin can see all appointments (no additional filter)

    if (status) {
      query.status = status;
    }

    if (date) {
      const startDate = moment(date).startOf('day');
      const endDate = moment(date).endOf('day');
      query.appointmentDate = {
        $gte: startDate.toDate(),
        $lte: endDate.toDate()
      };
    }

    const appointments = await Appointment.find(query)
      .populate('doctor', 'specialization consultationFee hospital')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .populate('patient', 'name email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'specialization consultationFee hospital')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .populate('patient', 'name email phone');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has access to this appointment
    const isPatient = appointment.patient._id.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/:id/status', [auth, authorize('doctor', 'admin')], async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'completed', 'cancelled', 'no-show'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // If user is a doctor, check if they own this appointment
    if (req.user.role === 'doctor') {
      const doctorInfo = await Doctor.findOne({ user: req.user._id });
      if (appointment.doctor.toString() !== doctorInfo._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    appointment.status = status;
    await appointment.save();

    res.json({
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has permission to cancel
    const isPatient = appointment.patient.toString() === req.user._id.toString();
    let isDoctor = false;
    
    if (req.user.role === 'doctor') {
      const doctorInfo = await Doctor.findOne({ user: req.user._id });
      isDoctor = appointment.doctor.toString() === doctorInfo._id.toString();
    }
    
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if appointment can be cancelled
    if (['completed', 'cancelled'].includes(appointment.status)) {
      return res.status(400).json({ message: 'Cannot cancel this appointment' });
    }

    appointment.status = 'cancelled';
    appointment.cancelledBy = req.user.role;
    appointment.cancellationReason = reason;

    await appointment.save();

    res.json({
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/:id/complete', [auth, authorize('doctor')], async (req, res) => {
  try {
    const { notes, prescription, diagnosis } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if doctor owns this appointment
    const doctorInfo = await Doctor.findOne({ user: req.user._id });
    if (appointment.doctor.toString() !== doctorInfo._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if appointment is confirmed
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed appointments can be completed' });
    }

    appointment.status = 'completed';
    appointment.notes = notes;
    appointment.prescription = prescription;
    appointment.diagnosis = diagnosis;

    await appointment.save();

    res.json({
      message: 'Appointment completed successfully',
      appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/doctor/:doctorId/availability', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Get the day of the week
    const dayOfWeek = moment(date).format('dddd').toLowerCase();
    
    // Find doctor's availability for this day
    const dayAvailability = doctor.availability.find(av => av.day === dayOfWeek);
    if (!dayAvailability || !dayAvailability.isAvailable) {
      return res.json({ availableSlots: [] });
    }

    // Generate time slots
    const startTime = moment(`${date} ${dayAvailability.startTime}`);
    const endTime = moment(`${date} ${dayAvailability.endTime}`);
    const slots = [];

    while (startTime.isBefore(endTime)) {
      slots.push(startTime.format('HH:mm'));
      startTime.add(30, 'minutes'); // 30-minute slots
    }

    // Get booked appointments for this date
    const bookedAppointments = await Appointment.find({
      doctor: req.params.doctorId,
      appointmentDate: new Date(date),
      status: { $in: ['pending', 'confirmed'] }
    }).select('appointmentTime');

    const bookedTimes = bookedAppointments.map(apt => apt.appointmentTime);
    const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));

    res.json({ availableSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;