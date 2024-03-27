const { check, validationResult } = require('express-validator');

const emailValidation = check('email').trim().isEmail().withMessage('Invalid email format').isLength({ max: 100 }).withMessage('Email cannot exceed 100 characters');

const passwordValidation = check('password').isLength({ min: 6, max: 100 }).withMessage('Password must be between 6 and 100 characters long');

const validateSignup = [
  check('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  emailValidation,
  passwordValidation,
];

const validateLogin = [
  emailValidation,
  passwordValidation,
];

const validateOTP = [
  emailValidation,
  check('OTP').trim().notEmpty().withMessage("OTP is mandatory").isLength({ max: 100 }).withMessage("Invalid OTP length")
]

const validateResetPass = [
  emailValidation,
  passwordValidation,
]

const validateEmail = [
  emailValidation,
]

const validateNote = [
  check('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }).withMessage('Title cannot exceed 255 characters'),
  check('description').trim().notEmpty().withMessage('Content is required'),
  check('tag').optional().trim().isLength({ max: 50 }).withMessage('Tag cannot exceed 50 characters')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { validateSignup, validateLogin, validateNote, validateEmail, validateOTP, validateResetPass, handleValidationErrors };
