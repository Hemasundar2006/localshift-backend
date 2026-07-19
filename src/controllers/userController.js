"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePushToken = exports.uploadAvatar = exports.uploadResume = exports.changePassword = exports.updateUserProfile = exports.getUserProfile = void 0;
const User_1 = require("../models/User");

const getUserProfile = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user._id);
        if (user) {
            // Generate unique referral code if missing
            if (!user.referralCode) {
                const safeName = user.name.replace(/[^a-zA-Z]/g, '').padEnd(4, 'X').substring(0, 4).toUpperCase();
                const safePhone = user.phone.replace(/[^0-9]/g, '').slice(-4).padStart(4, '0');
                user.referralCode = `${safeName}${safePhone}`;
                await user.save();
            }
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isPhoneVerified: user.isPhoneVerified,
                pushToken: user.pushToken,
                location: user.location,
                dob: user.dob,
                bio: user.bio,
                skills: user.skills,
                coins: user.coins,
                referralCode: user.referralCode,
                linkedAccounts: user.linkedAccounts || ['google'],
                shopName: user.shopName,
                shopAddress: user.shopAddress,
                resumeUrl: user.resumeUrl,
                resumeName: user.resumeName,
                avatarUrl: user.avatarUrl,
                preciseLocation: user.preciseLocation
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getUserProfile = getUserProfile;

const updateUserProfile = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user._id);
        if (user) {
            if (req.body.name)
                user.name = req.body.name;
            if (req.body.email)
                user.email = req.body.email;
            if (req.body.pushToken)
                user.pushToken = req.body.pushToken;
            if (req.body.role)
                user.role = req.body.role;
            if (req.body.role)
                user.role = req.body.role;
            if (req.body.dob)
                user.dob = req.body.dob;
            if (req.body.latitude !== undefined && req.body.longitude !== undefined) {
                user.location = {
                    type: 'Point',
                    coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
                };
            }
            if (req.body.bio !== undefined)
                user.bio = req.body.bio;
            if (req.body.skills !== undefined)
                user.skills = req.body.skills;
            if (req.body.linkedAccounts !== undefined)
                user.linkedAccounts = req.body.linkedAccounts;
            if (req.body.shopName !== undefined)
                user.shopName = req.body.shopName;
            if (req.body.shopAddress !== undefined)
                user.shopAddress = req.body.shopAddress;
            if (req.body.resumeUrl !== undefined)
                user.resumeUrl = req.body.resumeUrl;
            if (req.body.resumeName !== undefined)
                user.resumeName = req.body.resumeName;
            if (req.body.avatarUrl !== undefined)
                user.avatarUrl = req.body.avatarUrl;
            if (req.body.preciseLocation !== undefined)
                user.preciseLocation = req.body.preciseLocation;

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                isPhoneVerified: updatedUser.isPhoneVerified,
                pushToken: updatedUser.pushToken,
                location: updatedUser.location,
                dob: updatedUser.dob,
                bio: updatedUser.bio,
                skills: updatedUser.skills,
                coins: updatedUser.coins,
                referralCode: updatedUser.referralCode,
                linkedAccounts: updatedUser.linkedAccounts || [],
                shopName: updatedUser.shopName,
                shopAddress: updatedUser.shopAddress,
                resumeUrl: updatedUser.resumeUrl,
                resumeName: updatedUser.resumeName,
                avatarUrl: updatedUser.avatarUrl,
                preciseLocation: updatedUser.preciseLocation
            });
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateUserProfile = updateUserProfile;

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new password are required' });
    }
    try {
        const user = await User_1.User.findById(req.user._id);
        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword;
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Incorrect current password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.changePassword = changePassword;

const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a PDF file' });
        }
        const user = await User_1.User.findById(req.user._id);
        if (user) {
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            user.resumeUrl = fileUrl;
            user.resumeName = req.file.originalname;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                isPhoneVerified: updatedUser.isPhoneVerified,
                pushToken: updatedUser.pushToken,
                location: updatedUser.location,
                dob: updatedUser.dob,
                bio: updatedUser.bio,
                skills: updatedUser.skills,
                coins: updatedUser.coins,
                referralCode: updatedUser.referralCode,
                linkedAccounts: updatedUser.linkedAccounts || [],
                shopName: updatedUser.shopName,
                shopAddress: updatedUser.shopAddress,
                resumeUrl: updatedUser.resumeUrl,
                resumeName: updatedUser.resumeName,
                avatarUrl: updatedUser.avatarUrl,
                preciseLocation: updatedUser.preciseLocation
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.uploadResume = uploadResume;

const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image file' });
        }
        const user = await User_1.User.findById(req.user._id);
        if (user) {
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            user.avatarUrl = fileUrl;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                isPhoneVerified: updatedUser.isPhoneVerified,
                pushToken: updatedUser.pushToken,
                location: updatedUser.location,
                dob: updatedUser.dob,
                bio: updatedUser.bio,
                skills: updatedUser.skills,
                coins: updatedUser.coins,
                referralCode: updatedUser.referralCode,
                linkedAccounts: updatedUser.linkedAccounts || [],
                shopName: updatedUser.shopName,
                shopAddress: updatedUser.shopAddress,
                resumeUrl: updatedUser.resumeUrl,
                resumeName: updatedUser.resumeName,
                avatarUrl: updatedUser.avatarUrl,
                preciseLocation: updatedUser.preciseLocation
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.uploadAvatar = uploadAvatar;

const updatePushToken = async (req, res) => {
    try {
        const pushToken = req.body.pushToken || req.body.token;
        if (!pushToken) {
            return res.status(400).json({ message: 'Push token is required' });
        }
        
        const user = await User_1.User.findById(req.user._id);
        if (user) {
            user.pushToken = pushToken;
            await user.save();
            res.json({ message: 'Push token updated successfully', pushToken: user.pushToken });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('updatePushToken error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updatePushToken = updatePushToken;

const updatePushPreferences = async (req, res) => {
    try {
        const { pushToken, pushEnabled } = req.body;
        
        const user = await User_1.User.findById(req.user._id);
        if (user) {
            if (pushToken !== undefined) user.pushToken = pushToken;
            if (pushEnabled !== undefined) user.pushEnabled = pushEnabled;
            await user.save();
            res.json({ message: 'Push preferences updated successfully', pushToken: user.pushToken, pushEnabled: user.pushEnabled });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('updatePushPreferences error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updatePushPreferences = updatePushPreferences;
//# sourceMappingURL=userController.js.map