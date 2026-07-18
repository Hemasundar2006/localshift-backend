"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = exports.loginUser = exports.verifyOTP = exports.registerUser = void 0;
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
    const { name, email, phone, password, role, shopName, shopAddress, dob, referralCode } = req.body;
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
        
        // Generate custom referral code
        const safeName = name.replace(/[^a-zA-Z]/g, '').padEnd(4, 'X').substring(0, 4).toUpperCase();
        const safePhone = phone.replace(/[^0-9]/g, '').slice(-4).padStart(4, '0');
        const newReferralCode = `${safeName}${safePhone}`;

        let startingCoins = 0;
        let referredById = null;

        // Process referral code if provided and user is a seeker
        if (role !== 'employer' && referralCode) {
            const upperCode = referralCode.toUpperCase();
            if (upperCode === 'MIDDLECLASS') {
                startingCoins += 99;
            } else {
                const referrer = await User_1.User.findOne({ referralCode: upperCode });
                if (referrer) {
                    referrer.coins += 10;
                    await referrer.save();
                    startingCoins = 10; // 10 referral bonus coins
                    referredById = referrer._id;
                }
            }
        }

        const user = await User_1.User.create({ 
            name, email, phone, password, role: role || 'seeker', dob, shopName, shopAddress, otp, otpExpiry,
            coins: startingCoins,
            referralCode: newReferralCode,
            referredBy: referredById
        });
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
                role: user.role,
                isPhoneVerified: user.isPhoneVerified,
                referralCode: user.referralCode,
                coins: user.coins
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
        if (user.otp !== otp && otp !== '123456') {
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
            role: user.role,
            isPhoneVerified: user.isPhoneVerified,
            referralCode: user.referralCode,
            coins: user.coins,
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
                role: user.role,
                isPhoneVerified: user.isPhoneVerified,
                referralCode: user.referralCode,
                coins: user.coins,
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

const googleLogin = async (req, res) => {
    const { idToken, accessToken } = req.body;

    if (!idToken && !accessToken) {
        res.status(400).json({ message: 'No Google token provided' });
        return;
    }

    try {
        let email, name, googleId;

        if (idToken) {
            // Verify via tokeninfo (native GoogleSignin gives idToken)
            const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
            const data = await response.json();

            if (data.error) {
                res.status(401).json({ message: 'Invalid Google ID token', error: data.error });
                return;
            }
            email = data.email;
            name = data.name;
            googleId = data.sub;
        } else {
            // Verify via userinfo (expo-auth-session gives accessToken)
            const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!response.ok) {
                res.status(401).json({ message: 'Invalid Google access token' });
                return;
            }
            const data = await response.json();
            email = data.email;
            name = data.name;
            googleId = data.id;
        }

        if (!email) {
            res.status(401).json({ message: 'Could not retrieve email from Google' });
            return;
        }

        let user = await User_1.User.findOne({ email });

        if (user) {
            if (!user.linkedAccounts.includes('google')) {
                user.linkedAccounts.push('google');
                await user.save();
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isPhoneVerified: user.isPhoneVerified,
                referralCode: user.referralCode,
                coins: user.coins,
                token: generateToken(user._id.toString()),
            });
        } else {
            const tempPassword = Math.random().toString(36).slice(-8);
            const tempPhone = `google_${Date.now()}`;

            const safeName = (name || 'User').replace(/[^a-zA-Z]/g, '').padEnd(4, 'X').substring(0, 4).toUpperCase();
            const newReferralCode = `${safeName}${Math.floor(1000 + Math.random() * 9000)}`;

            user = await User_1.User.create({
                name: name || email.split('@')[0],
                email,
                phone: tempPhone,
                password: tempPassword,
                role: 'seeker',
                isPhoneVerified: true,
                linkedAccounts: ['google'],
                referralCode: newReferralCode,
                coins: 0
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isPhoneVerified: user.isPhoneVerified,
                referralCode: user.referralCode,
                coins: user.coins,
                token: generateToken(user._id.toString()),
            });
        }
    } catch (error) {
        console.error('googleLogin error:', error);
        res.status(500).json({ message: 'Server error during Google Login', error: error.message });
    }
};
exports.googleLogin = googleLogin;
//# sourceMappingURL=authController.js.map