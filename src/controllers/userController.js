"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateUserProfile = exports.getUserProfile = void 0;
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
                linkedAccounts: user.linkedAccounts || ['google']
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
                linkedAccounts: updatedUser.linkedAccounts || []
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
//# sourceMappingURL=userController.js.map