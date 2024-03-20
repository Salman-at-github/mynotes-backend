const express = require('express');
const router = express.Router();
const userModel = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const decodeUser = require('../middleware/decodeUser');
const OTPModel = require('../models/OTP');
const { generateOTP, sendOTP, sendErrorResponse } = require('../utils/helpers');

const signUp = async (req, res) => {
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
        return sendErrorResponse(res, 401, "OTP not verified earlier. Please enter your email and verify the OTP");
      } else {
        return sendErrorResponse(res, 401, "No OTP sent. Please send OTP first.");
      }
  
      // Add return statement here to terminate the function
      return;
  
    } catch (error) {
      console.error(error.message);
      sendErrorResponse(res, 500, "Internal Server Error");
    }
  }

  const signIn = async (req, res) => {
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
  }

  const sendOTPEmail = async (req, res) => {
    try {
      const { email } = req.body;
      const foundUser = await userModel.findOne({ email });
  
      if (!foundUser) {
        const gotOTP = generateOTP();
        await sendOTP(email, gotOTP);
        await OTPModel.create({email: email, OTP: gotOTP})
        res.status(200).json({ success: true, message: "OTP sent successfully!" });
  
      } else {
        sendErrorResponse(res, 401, "User exists!");
      }
    } catch (error) {
      console.log(error);
      sendErrorResponse(res, 500, "Internal Server Error");
    }
  }

  const verifyOTP = async (req, res) => {
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
  }

  const getUserDetails = async(req,res)=>{
    const {id} = req.user; //form decodeUser mwr
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
}

const resendOTPEmail = async(req,res)=>{
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
}

const resetPassword =  async(req,res)=>{
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
}

module.exports = {signUp, signIn, sendOTPEmail , verifyOTP, getUserDetails, resendOTPEmail, resetPassword};