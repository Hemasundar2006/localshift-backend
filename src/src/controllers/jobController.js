"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobs = exports.createJob = void 0;
const Job_1 = require("../models/Job");
const User_1 = require("../models/User");
const Notification_1 = require("../models/Notification");
const axios_1 = __importDefault(require("axios"));
// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private
const createJob = async (req, res) => {
    const { title, description, payRate, date, startTime, endTime, location, latitude, longitude } = req.body;
    try {
        const job = new Job_1.Job({
            employer: req.user._id,
            title,
            description,
            payRate,
            date,
            startTime,
            endTime,
            location,
            coordinates: latitude !== undefined && longitude !== undefined ? {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            } : {
                type: 'Point',
                coordinates: [0, 0]
            }
        });
        const createdJob = await job.save();
        
        // Find and notify nearby users (within 10km) if coordinates are valid
        if (latitude !== undefined && longitude !== undefined) {
            try {
                const nearbyUsers = await User_1.User.find({
                    _id: { $ne: req.user._id },
                    location: {
                        $near: {
                            $geometry: {
                                type: 'Point',
                                coordinates: [parseFloat(longitude), parseFloat(latitude)]
                            },
                            $maxDistance: 10000 // 10km in meters
                        }
                    }
                });
                
                for (const user of nearbyUsers) {
                    // Create in-app notification
                    await Notification_1.Notification.create({
                        user: user._id,
                        title: 'New Shift Nearby!',
                        message: `${createdJob.title} at ${createdJob.location} is open for applications.`,
                        type: 'new-job'
                    });
                    
                    // Send push notification if pushToken exists
                    if (user.pushToken) {
                        try {
                            await axios_1.default.post('https://exp.host/--/api/v2/push/send', {
                                to: user.pushToken,
                                sound: 'default',
                                title: 'New Shift Nearby!',
                                body: `${createdJob.title} at ${createdJob.location} ($${createdJob.payRate}/hr)`,
                                data: { jobId: createdJob._id }
                            });
                        }
                        catch (pushErr) {
                            console.error(`Failed to send push notification to user ${user._id}:`, pushErr.message);
                        }
                    }
                }
            }
            catch (geoError) {
                console.error('Failed to notify nearby users:', geoError);
            }
        }
        res.status(201).json(createdJob);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create job', error: error.message });
    }
};
exports.createJob = createJob;
// @desc    Get all open jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
    try {
        const jobs = await Job_1.Job.find({ status: 'open' }).populate('employer', 'name email');
        res.json(jobs);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch jobs' });
    }
};
exports.getJobs = getJobs;
//# sourceMappingURL=jobController.js.map