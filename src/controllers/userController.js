"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = void 0;
const User_1 = require("../models/User");
const getUserProfile = async (req, res) => {
    const user = req.user;
    if (user) {
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
            skills: user.skills
        });
    }
    else {
        res.status(404).json({ message: 'User not found' });
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
                skills: updatedUser.skills
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
//# sourceMappingURL=userController.js.map