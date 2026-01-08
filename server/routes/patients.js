const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const PatientRecord = require('../models/PatientRecord');
const auth = require('../middleware/auth');
const authorize = require('../middleware/roleAuth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   POST /api/patients
// @desc    Register new patient (Receptionist/Admin)
// @access  Receptionist, Admin
router.post(
  '/',
  authorize('receptionist', 'admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('age').isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
    body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
    body('bloodGroup')
      .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
      .withMessage('Invalid blood group'),
    body('contactNumber').trim().notEmpty().withMessage('Contact number is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name,
        email,
        password,
        age,
        gender,
        bloodGroup,
        contactNumber,
        address,
        medicalHistory,
        allergies,
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user with patient role
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'patient',
      });

      // Create patient record
      const patientRecord = await PatientRecord.create({
        patientID: user._id,
        age,
        gender,
        bloodGroup,
        contactNumber,
        address,
        medicalHistory: medicalHistory || [],
        allergies: allergies || [],
      });

      res.status(201).json({
        message: 'Patient registered successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        patientRecord,
      });
    } catch (error) {
      console.error('Register patient error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// @route   GET /api/patients
// @desc    Get all patients
// @access  Admin, Doctor, Receptionist
router.get('/', authorize('admin', 'doctor', 'receptionist'), async (req, res) => {
  try {
    const patients = await PatientRecord.find()
      .populate('patientID', 'name email')
      .sort({ createdAt: -1 });

    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/patients/:id
// @desc    Get patient by ID
// @access  Admin, Doctor, Receptionist, Patient (own record only)
router.get('/:id', async (req, res) => {
  try {
    const patientId = req.params.id;

    // Patients can only view their own record
    if (req.user.role === 'patient' && patientId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Receptionists cannot view medical history (we'll filter this in frontend)
    const patientRecord = await PatientRecord.findOne({ patientID: patientId })
      .populate('patientID', 'name email role');

    if (!patientRecord) {
      return res.status(404).json({ message: 'Patient record not found' });
    }

    res.json(patientRecord);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/patients/:id
// @desc    Update patient personal details (non-medical)
// @access  Receptionist, Admin
router.put(
  '/:id',
  authorize('receptionist', 'admin'),
  [
    body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
    body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
    body('bloodGroup')
      .optional()
      .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
      .withMessage('Invalid blood group'),
    body('contactNumber').optional().trim().notEmpty().withMessage('Contact number cannot be empty'),
    body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const patientId = req.params.id;
      const { age, gender, bloodGroup, contactNumber, address } = req.body;

      const patientRecord = await PatientRecord.findOne({ patientID: patientId });

      if (!patientRecord) {
        return res.status(404).json({ message: 'Patient record not found' });
      }

      // Update only non-medical fields
      if (age !== undefined) patientRecord.age = age;
      if (gender) patientRecord.gender = gender;
      if (bloodGroup) patientRecord.bloodGroup = bloodGroup;
      if (contactNumber) patientRecord.contactNumber = contactNumber;
      if (address) patientRecord.address = address;

      await patientRecord.save();

      res.json({
        message: 'Patient record updated successfully',
        patientRecord,
      });
    } catch (error) {
      console.error('Update patient error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

module.exports = router;
