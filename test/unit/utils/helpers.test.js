const { generateOTP } = require("../../../utils/helpers")

describe('Helper functions', () => {
    it('generates a 6 digit OTP', () => {
        const otp = generateOTP();
        expect(otp.length).toBe(6);
        expect(/^\d+$/.test(otp)).toBe(true); // Check if OTP consists only of digits
    });

    it('generates unique OTPs', () => {
        const otp1 = generateOTP();
        const otp2 = generateOTP();
        expect(otp1).not.toBe(otp2);
    });

    it('handles edge cases', () => {
        // Test for generating OTP with length 0
        const otpZeroLength = generateOTP(0);
        expect(otpZeroLength).toBe('');

        // Test for generating OTP with negative length
        const otpNegativeLength = generateOTP(-1);
        expect(otpNegativeLength).toBe('');

    });
});
