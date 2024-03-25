const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
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

router.post(
  "/signup",
  [
    body("email", "Enter a valid email").isEmail(),
    body("name", "Enter a valid name (min 3 chars)").isLength({ min: 2 }),
    body("password", "Password must be min 8 chars").isLength({ min: 8 }),
  ],
  signUp
);

router.post(
  "/signin",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank!").exists(),
  ],
  signIn
);

router.post(
  "/sendotp",
  [body("email", "Enter a valid email").isEmail()],
  sendOTPEmail
);

router.post("/verifyotp", verifyOTP);

router.get("/user/details", decodeUser, getUserDetails);

//sentOTP again for pass reset
router.post("/sendotpagain", resendOTPEmail);

router.post("/resetpassword", resetPassword);

module.exports = router;
