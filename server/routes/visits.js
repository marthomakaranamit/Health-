const express = require('express');
const { body, validationResult } = require('express-validator');
const MedicalVisit = require('../models/MedicalVisit');
const auth = require('../middleware/auth');
const authorize = require('../middleware/roleAuth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   POST /api/visits
// @desc    Add medical visit (Doctor only)
// @access  Doctor
router.post(
  '/',
  authorize('doctor'),
  [
    body('patientID').notEmpty().withMessage('Patient ID is required'),
    body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
    body('prescription').trim().notEmpty().withMessage('Prescription is required'),
    body('notes').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { patientID, diagnosis, prescription, notes, visitDate } = req.body;

      // Create medical visit
      const visit = await MedicalVisit.create({
        patientID,
        doctorID: req.user._id,
        diagnosis,
        prescription,
        notes: notes || '',
        visitDate: visitDate || new Date(),
      });

      // Populate patient and doctor info
      await visit.populate('patientID', 'name email');
      await visit.populate('doctorID', 'name email');

      res.status(201).json({
        message: 'Medical visit added successfully',
        visit,
      });
    } catch (error) {
      console.error('Add visit error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// @route   GET /api/visits/:patientId
// @desc    Get patient visit history
// @access  Doctor, Admin, Patient (own visits only)
router.get('/:patientId', async (req, res) => {
  try {
    const patientId = req.params.patientId;

    // Patients can only view their own visits
    if (req.user.role === 'patient' && patientId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Doctors can only view visits for their patients (or all if admin)
    const query = { patientID: patientId };
    if (req.user.role === 'doctor') {
      query.doctorID = req.user._id;
    }

    const visits = await MedicalVisit.find(query)
      .populate('patientID', 'name email')
      .populate('doctorID', 'name email')
      .sort({ visitDate: -1 });

    res.json(visits);
  } catch (error) {
    console.error('Get visits error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/visits
// @desc    Get all visits (Doctor/Admin)
// @access  Doctor, Admin
router.get('/', authorize('doctor', 'admin'), async (req, res) => {
  try {
    const query = {};
    
    // Doctors can only see their own visits
    if (req.user.role === 'doctor') {
      query.doctorID = req.user._id;
    }

    const visits = await MedicalVisit.find(query)
      .populate('patientID', 'name email')
      .populate('doctorID', 'name email')
      .sort({ visitDate: -1 });

    res.json(visits);
  } catch (error) {
    console.error('Get all visits error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
