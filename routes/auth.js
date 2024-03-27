const express = require("express");
const router = express.Router();
const decodeUser = require("../middleware/decodeUser");

const {
  signUp,
  signIn,
  sendOTPEmail,
  verifyOTP,
  getUserDetails,
  resendOTPEmail,
  resetPassword,
} = require("../controllers/authController");

const {
  validateSignup,
  validateLogin,
  validateEmail,
  validateOTP,
  validateResetPass,
  handleValidationErrors,
} = require("../middleware/validation");

router.post("/signup", validateSignup, handleValidationErrors, signUp);

router.post("/signin", validateLogin, handleValidationErrors, signIn);

router.post("/sendotp", validateEmail, handleValidationErrors, sendOTPEmail);

router.post("/verifyotp", validateOTP, handleValidationErrors, verifyOTP);

router.get("/user/details", decodeUser, getUserDetails);

//sentOTP again for pass reset
router.post("/sendotpagain", validateEmail, handleValidationErrors, resendOTPEmail);

router.post("/resetpassword", validateResetPass, handleValidationErrors, resetPassword);

module.exports = router;
