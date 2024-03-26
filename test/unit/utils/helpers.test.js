const { generateOTP } = require("../../../utils/helpers")

describe('Helper functions', ()=>{
    it('generates a 6 digit OTP', ()=>{
        const otp = generateOTP()
        expect(otp.length).toBe(6)
    })
})