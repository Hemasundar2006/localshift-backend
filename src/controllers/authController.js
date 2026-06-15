"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.verifyOTP = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const textbee_1 = require("../services/textbee");
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
const generateOTP = () => {
    return '123456'; // Default OTP for development/testing
};
const registerUser = async (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
        res.status(400).json({ message: 'Please provide all required fields (name, email, phone, password)' });
        return;
    }
    try {
        const userExists = await User_1.User.findOne({ $or: [{ email }, { phone }] });
        if (userExists) {
            res.status(400).json({ message: 'User with this email or phone already exists' });
            return;
        }
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
        const user = await User_1.User.create({ name, email, phone, password, otp, otpExpiry });
        if (user) {
            // Send the SMS
            const message = `Your LocalShift verification code is: ${otp}. It is valid for 10 minutes.`;
            try {
                await (0, textbee_1.sendSMS)(phone, message);
            }
            catch (smsError) {
                console.error('Failed to send verification SMS:', smsError);
                // We still successfully registered the user, but couldn't send SMS
            }
            res.status(201).json({
                message: 'Registration successful! Please verify your phone number.',
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isPhoneVerified: user.isPhoneVerified
                // Not returning the JWT token until OTP is verified
            });
        }
        else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.registerUser = registerUser;
const verifyOTP = async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
        res.status(400).json({ message: 'Phone and OTP are required' });
        return;
    }
    try {
        const user = await User_1.User.findOne({ phone });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (user.isPhoneVerified) {
            res.status(400).json({ message: 'Phone is already verified' });
            return;
        }
        if (user.otp !== otp) {
            res.status(400).json({ message: 'Invalid OTP' });
            return;
        }
        if (user.otpExpiry && user.otpExpiry < new Date()) {
            res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
            return;
        }
        // Mark as verified and clear OTP fields
        user.isPhoneVerified = true;
        user.otp = '';
        user.otpExpiry = null;
        await user.save();
        res.json({
            message: 'Phone verified successfully!',
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isPhoneVerified: user.isPhoneVerified,
            token: generateToken(user._id.toString()), // Give them access now
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.verifyOTP = verifyOTP;
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User_1.User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            // Enforce phone verification before login
            if (!user.isPhoneVerified) {
                res.status(401).json({ message: 'Please verify your phone number first' });
                return;
            }
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isPhoneVerified: user.isPhoneVerified,
                token: generateToken(user._id.toString()),
            });
        }
        else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.loginUser = loginUser;
//# sourceMappingURL=authController.js.map