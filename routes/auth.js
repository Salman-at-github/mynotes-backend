const express = require('express');
const router = express.Router();
const userModel = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser');
const OTPModel = require('../models/OTP');
const { generateOTP, sendOTP } = require('../utils/helpers');


// Helper function to send response with error
const sendErrorResponse = (res, statusCode, error) => {
  res.status(statusCode).json({ success: false, error: error.message || error });
};

router.post('/signup',
  [body('email', "Enter a valid email").isEmail(),
  body('name', "Enter a valid name (min 3 chars)").isLength({ min: 2 }),
  body('password', "Password must be min 8 chars").isLength({ min: 8 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendErrorResponse(res, 400, errors.array());
      }

      const match = await userModel.findOne({ email: req.body.email });
      if (match) {
        return sendErrorResponse(res, 400, "A user with the same email already exists. Please use a different one.");
      }

      const otpStatus = await OTPModel.findOne({ email: req.body.email });
      if (otpStatus && otpStatus.verified) {
        const salt = await bcrypt.genSalt(10);
        const securePassword = await bcrypt.hash(req.body.password, salt);

        const userCreated = await userModel.create({
          name: req.body.name,
          password: securePassword,
          email: req.body.email,
        });

        await otpStatus.remove();
        res.status(201).json({ success: true, message: "User created!", user: userCreated });
      } else if (otpStatus && !otpStatus.verified) {
        sendErrorResponse(res, 401, "OTP not verified earlier. Please enter your email and verify the OTP");
      } else {
        sendErrorResponse(res, 401, "No OTP sent");
      }

    } catch (error) {
      console.error(error.message);
      sendErrorResponse(res, 500, "Internal Server Error");
    }
  });

router.post('/signin',
  [body('email', "Enter a valid email").isEmail(),
  body('password', "Password cannot be blank!").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendErrorResponse(res, 400, errors.array());
      }

      const { email, password } = req.body;
      const foundUser = await userModel.findOne({ email });

      if (!foundUser) {
        return sendErrorResponse(res, 400, "Please enter the correct email as no person with entered email was found");
      }

      const passCompare = await bcrypt.compare(password, foundUser.password);
      if (!passCompare) {
        return sendErrorResponse(res, 400, "Please enter the correct password");
      }

      const userIDPayload = {
        user: {
          id: foundUser.id
        }
      };
      const JWT_SECRET = process.env.MY_JWT_SECRET
      const authtoken = jwt.sign(userIDPayload, JWT_SECRET);
      res.status(200).json({ success: true, authtoken });

    } catch (error) {
      console.error(error.message);
      sendErrorResponse(res, 500, "Internal Server Error");
    }
  });

router.post('/sendotp', async (req, res) => {
  try {
    const { email } = req.body;
    const foundUser = await userModel.findOne({ email });

    if (!foundUser) {
      const gotOTP = generateOTP();
      await sendOTP(email, gotOTP);
      res.status(200).json({ success: true, message: "OTP sent successfully!" });

    } else {
      sendErrorResponse(res, 401, "User exists!");
    }
  } catch (error) {
    console.log(error);
    sendErrorResponse(res, 500, "Internal Server Error");
  }
});

router.post('/verifyotp', async (req, res) => {
  try {
    const { email, OTP } = req.body;
    const foundUserOTP = await OTPModel.findOne({ email });

    if (!foundUserOTP) {
      sendErrorResponse(res, 404, "Can't verify OTP if not sent in the first place!");
    } else {
      if (OTP !== foundUserOTP.OTP) {
        sendErrorResponse(res, 401, "Incorrect OTP");
      } else {
        foundUserOTP.verified = true;
        await foundUserOTP.save();
        res.status(200).json({ success: true });
      }
    }
  } catch (error) {
    console.log(error);
    sendErrorResponse(res, 500, "Internal Server Error");
  }
});

router.get('/user/getdetails',fetchUser, async(req,res)=>{
        const {id} = req.user; //form fetchUser mwr
        try {
            const foundUser = await userModel.findOne({_id:id}).select("-password");
            if(! foundUser){
                res.status(404).send("User Not found!")
            } else {
                res.status(200).json(foundUser)
            }
        } catch (error) {
            console.log(error)
        }
    });

//sentOTP again for pass reset
router.post('/sendotpagain',async(req,res)=>{
    const {email} = req.body;
    let success = false;
    try {
        const foundUser = await userModel.findOne({email:email});
        if(!foundUser){
            res.status(404).send("User does not exist. Please sign up!")
        } else {
            const gotOTP = generateOTP();
            await sendOTP(email, gotOTP);
            success = true;
            const oldOTP = await OTPModel.findOne({email:email});
            if(oldOTP){
                await oldOTP.remove();
                await OTPModel.create({email: email, OTP: gotOTP})
                    success = true;
            } else {
                    await OTPModel.create({email: email, OTP: gotOTP})
                    success = true;
            }
            res.status(200).json({success});
        }
    } catch (error) {
        console.log(error)
    }
});


router.post('/resetpassword',async(req,res)=>{
    const {email,password} = req.body;
    let success = false;
    try {
        const userExists = await userModel.findOne({email:email});
        const userOTPsent = await OTPModel.findOne({email:email})
        if(userExists){
            if(userOTPsent){
                if(userOTPsent.verified){
                    const salts = await bcrypt.genSalt();
                    const securePass = await bcrypt.hash(password,salts);
                    userExists.password = securePass;
                    await userExists.save();
                    success = true;
                    res.status(200).json({success});
                    //remove the otp after changing pass
                    await userOTPsent.remove();
                } else {
                    res.status(401).json({success,error:"OTP not verified so can't change password"})
                }
            } else {
                res.status(401).json({success,error:"Can't change pass as OTP not sent!"})
            }
        } else {
            res.status(404).json({success,error:"User not found, can't change password."})
        }
    } catch (error) {
        
    }
})

module.exports = router;
