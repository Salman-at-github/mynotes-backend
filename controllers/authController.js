const userModel = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OTPModel = require('../models/OTP');
const { generateOTP, sendOTP, sendErrorResponse } = require('../utils/helpers');

const signUp = async (req, res) => {
    try {
      const match = await userModel.findOne({ email: req.body.email });
      if (match) {
        return sendErrorResponse(res, 409, "A user with the same email already exists. Please use a different one.");
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
      return sendErrorResponse(res, 500, error.message);
    }
  }

  const signIn = async (req, res) => {
    try {
      const { email, password } = req.body;
      const foundUser = await userModel.findOne({ email });

      if (!foundUser) {
        return sendErrorResponse(res, 404, "Please enter the correct email as no person with entered email was found");
      }

      const passCompare = await bcrypt.compare(password, foundUser.password);
      if (!passCompare) {
        return sendErrorResponse(res, 401, "Please enter the correct password");
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
      return sendErrorResponse(res, 500, error.message)
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
        return sendErrorResponse(res, 401, "User exists!");
      }
    } catch (error) {
      return sendErrorResponse(res, 500, error.message)
    }
  }

  const verifyOTP = async (req, res) => {
    try {
      const { email, OTP } = req.body;
      const foundUserOTP = await OTPModel.findOne({ email });
  
      if (!foundUserOTP) {
        return sendErrorResponse(res, 404, "Can't verify OTP if not sent in the first place!");
      } else {
        if (OTP !== foundUserOTP.OTP) {
          return sendErrorResponse(res, 401, "Incorrect OTP");
        } else {
          foundUserOTP.verified = true;
          await foundUserOTP.save();
          res.status(200).json({ success: true });
        }
      }
    } catch (error) {
      return sendErrorResponse(res, 500, error.message)
    }
  }

  const getUserDetails = async(req,res)=>{
    const {id} = req.user; //req.user comes from the jwt
    try {
        const foundUser = await userModel.findOne({_id:id}).select("-password");
        if(! foundUser){
            return sendErrorResponse(res, 404, "User not found");
        } else {
            res.status(200).json(foundUser)
        }
    } catch (error) {
      return sendErrorResponse(res, 500, error.message)
    }
}

const resendOTPEmail = async(req,res)=>{
    const {email} = req.body;
    let success = false;
    try {
        const foundUser = await userModel.findOne({email:email});
        if(!foundUser){
            return sendErrorResponse(res, 401, "User does not exist. Please sign up!")
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
      return sendErrorResponse(res, 500, error.message)
    }
}

const resetPassword =  async(req,res)=>{
    const {email,password} = req.body;
    let success = false;
    try {
        const userExists = await userModel.findOne({email:email});
        if(userExists){
            const userOTPsent = await OTPModel.findOne({email:email})
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
                    return sendErrorResponse(res, 401, "OTP not verified so can't change password")
                }
            } else {
              return sendErrorResponse(res, 401, "Can't change pass as OTP not sent!")
            }
        } else {
          return sendErrorResponse(res, 404, "User not found, can't change password.")
        }
    } catch (error) {
    return sendErrorResponse(res, 500, error.message)
    }
}

module.exports = {signUp, signIn, sendOTPEmail , verifyOTP, getUserDetails, resendOTPEmail, resetPassword};