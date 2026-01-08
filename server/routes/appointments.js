const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const auth = require('../middleware/auth');
const authorize = require('../middleware/roleAuth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   POST /api/appointments
// @desc    Create appointment
// @access  Receptionist, Admin, Patient (own appointments)
router.post(
  '/',
  [
    body('patientID').notEmpty().withMessage('Patient ID is required'),
    body('doctorID').notEmpty().withMessage('Doctor ID is required'),
    body('appointmentDate').notEmpty().withMessage('Appointment date is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { patientID, doctorID, appointmentDate } = req.body;

      // Patients can only create appointments for themselves
      if (req.user.role === 'patient' && patientID !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only create appointments for yourself' });
      }

      // Verify patient exists and is a patient
      const patient = await User.findById(patientID);
      if (!patient || patient.role !== 'patient') {
        return res.status(400).json({ message: 'Invalid patient' });
      }

      // Verify doctor exists and is a doctor
      const doctor = await User.findById(doctorID);
      if (!doctor || doctor.role !== 'doctor') {
        return res.status(400).json({ message: 'Invalid doctor' });
      }

      // Create appointment
      const appointment = await Appointment.create({
        patientID,
        doctorID,
        appointmentDate: new Date(appointmentDate),
        status: 'Scheduled',
      });

      // Populate patient and doctor info
      await appointment.populate('patientID', 'name email');
      await appointment.populate('doctorID', 'name email');

      res.status(201).json({
        message: 'Appointment created successfully',
        appointment,
      });
    } catch (error) {
      console.error('Create appointment error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// @route   GET /api/appointments
// @desc    Get appointments (filtered by role)
// @access  All authenticated users
router.get('/', async (req, res) => {
  try {
    const query = {};

    // Filter based on role
    if (req.user.role === 'patient') {
      query.patientID = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctorID = req.user._id;
    }
    // Admin and receptionist can see all appointments

    const appointments = await Appointment.find(query)
      .populate('patientID', 'name email')
      .populate('doctorID', 'name email')
      .sort({ appointmentDate: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment status
// @access  Admin, Receptionist, Doctor
router.put(
  '/:id',
  authorize('admin', 'receptionist', 'doctor'),
  [
    body('status')
      .isIn(['Scheduled', 'Completed', 'Cancelled'])
      .withMessage('Invalid status'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const appointmentId = req.params.id;
      const { status } = req.body;

      const appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Doctors can only update their own appointments
      if (req.user.role === 'doctor' && appointment.doctorID.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      appointment.status = status;
      await appointment.save();

      // Populate patient and doctor info
      await appointment.populate('patientID', 'name email');
      await appointment.populate('doctorID', 'name email');

      res.json({
        message: 'Appointment updated successfully',
        appointment,
      });
    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment
// @access  Admin, Receptionist, Patient (own appointments)
router.delete('/:id', async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Patients can only cancel their own appointments
    if (req.user.role === 'patient' && appointment.patientID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Receptionists and admins can cancel any appointment
    if (req.user.role !== 'admin' && req.user.role !== 'receptionist' && req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Appointment.findByIdAndDelete(appointmentId);

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
