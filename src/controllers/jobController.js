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
    const { title, description, monthlySalary, shopName, mobileNumber, address, date, startTime, endTime, location, latitude, longitude, broadcastRadius } = req.body;
    const radius = broadcastRadius ? parseInt(broadcastRadius, 10) : 5;
    try {
        const job = new Job_1.Job({
            employer: req.user._id,
            title,
            description,
            monthlySalary,
            shopName,
            mobileNumber,
            address,
            date,
            startTime,
            endTime,
            location: location || address,
            broadcastRadius: radius,
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
                            $maxDistance: radius * 1000 // Convert km to meters
                        }
                    }
                });
                
                const { sendPushNotification } = require('../services/notificationService');

                for (const user of nearbyUsers) {
                    // Create in-app notification
                    await Notification_1.Notification.create({
                        userId: user._id,
                        title: 'New Shift Nearby!',
                        message: `${createdJob.title} at ${createdJob.location} is open for applications.`,
                        type: 'job_alert',
                        relatedId: createdJob._id
                    });
                    
                    // Send push notification if pushToken exists
                    if (user.pushToken) {
                        await sendPushNotification(
                            user.pushToken, 
                            'New Shift Nearby!', 
                            `${createdJob.title} at ${createdJob.shopName} ($${createdJob.monthlySalary}/mo)`,
                            { jobId: createdJob._id }
                        );
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

const getEmployerJobs = async (req, res) => {
    try {
        const jobs = await Job_1.Job.find({ employer: req.user._id })
            .populate('applicants', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch employer jobs' });
    }
};
exports.getEmployerJobs = getEmployerJobs;

const applyForJob = async (req, res) => {
    try {
        const job = await Job_1.Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        
        if (job.applicants.includes(req.user._id)) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }
        
        job.applicants.push(req.user._id);
        await job.save();

        // Notify employer (in-app, push, and SMS)
        try {
            const employer = await User_1.User.findById(job.employer);
            if (employer) {
                // In-app notification
                await Notification_1.Notification.create({
                    userId: employer._id,
                    title: 'New Applicant!',
                    message: `${req.user.name} applied for your job "${job.title}".`,
                    type: 'job_alert',
                    relatedId: job._id
                });
                
                // Push notification
                if (employer.pushToken) {
                    const { sendPushNotification } = require('../services/notificationService');
                    await sendPushNotification(
                        employer.pushToken,
                        'New Applicant!',
                        `${req.user.name} has applied for "${job.title}".`,
                        { jobId: job._id }
                    );
                }
                
                // SMS notification
                if (employer.phone) {
                    try {
                        const { sendSMS } = require('../services/textbee');
                        const smsMessage = `Hi ${employer.name}, ${req.user.name} has applied for your job '${job.title}' on LocalShift. Log in to check their credentials.`;
                        await sendSMS(employer.phone, smsMessage);
                        console.log(`SMS sent to employer phone: ${employer.phone}`);
                    } catch (smsErr) {
                        console.warn('SMS delivery skipped or failed:', smsErr.message);
                    }
                }
            }
        } catch (notifErr) {
            console.error('Failed to notify employer on application:', notifErr);
        }
        
        res.json({ message: 'Successfully applied for job', job });
    } catch (error) {
        res.status(500).json({ message: 'Failed to apply for job' });
    }
};
exports.applyForJob = applyForJob;

const hireWorker = async (req, res) => {
    const { workerId } = req.body;
    try {
        const job = await Job_1.Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        
        if (job.employer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to hire for this job' });
        }
        
        if (!job.applicants.includes(workerId)) {
            return res.status(400).json({ message: 'User has not applied for this job' });
        }
        
        job.worker = workerId;
        job.status = 'assigned';
        await job.save();
        
        // Notify the hired worker
        try {
            const hiredUser = await User_1.User.findById(workerId);
            if (hiredUser) {
                // Create in-app notification
                await Notification_1.Notification.create({
                    userId: workerId,
                    title: 'You are Hired!',
                    message: `You have been hired for "${job.title}" at "${job.shopName}". Check details in My Shifts.`,
                    type: 'job_alert',
                    relatedId: job._id
                });
                
                // Push notification
                if (hiredUser.pushToken) {
                    const { sendPushNotification } = require('../services/notificationService');
                    await sendPushNotification(
                        hiredUser.pushToken,
                        'You are Hired!',
                        `You have been hired for "${job.title}" at "${job.shopName}".`,
                        { jobId: job._id }
                    );
                }
            }
        } catch (notifErr) {
            console.error('Failed to notify hired worker:', notifErr);
        }
        
        res.json({ message: 'Worker hired successfully', job });
    } catch (error) {
        res.status(500).json({ message: 'Failed to hire worker', error: error.message });
    }
};
exports.hireWorker = hireWorker;

const checkInJob = async (req, res) => {
    try {
        const job = await Job_1.Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        
        if (job.worker.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized. You are not hired for this job' });
        }
        
        job.status = 'in-progress';
        job.checkInTime = new Date();
        await job.save();
        
        // Notify employer
        try {
            const employer = await User_1.User.findById(job.employer);
            if (employer) {
                await Notification_1.Notification.create({
                    userId: employer._id,
                    title: 'Worker Checked In',
                    message: `${req.user.name} checked in for "${job.title}" at ${job.shopName}.`,
                    type: 'job_alert',
                    relatedId: job._id
                });
                
                if (employer.pushToken) {
                    const { sendPushNotification } = require('../services/notificationService');
                    await sendPushNotification(
                        employer.pushToken,
                        'Worker Checked In',
                        `${req.user.name} has checked in for "${job.title}".`,
                        { jobId: job._id }
                    );
                }
            }
        } catch (notifErr) {
            console.error('Failed to notify employer on checkin:', notifErr);
        }
        
        res.json({ message: 'Checked in successfully', job });
    } catch (error) {
        res.status(500).json({ message: 'Failed to check in', error: error.message });
    }
};
exports.checkInJob = checkInJob;

const checkOutJob = async (req, res) => {
    try {
        const job = await Job_1.Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        
        if (job.worker.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized. You are not hired for this job' });
        }
        
        job.status = 'completed';
        job.checkOutTime = new Date();
        await job.save();
        
        // Notify employer
        try {
            const employer = await User_1.User.findById(job.employer);
            if (employer) {
                await Notification_1.Notification.create({
                    userId: employer._id,
                    title: 'Worker Checked Out',
                    message: `${req.user.name} checked out of "${job.title}" at ${job.shopName}.`,
                    type: 'job_alert',
                    relatedId: job._id
                });
                
                if (employer.pushToken) {
                    const { sendPushNotification } = require('../services/notificationService');
                    await sendPushNotification(
                        employer.pushToken,
                        'Worker Checked Out',
                        `${req.user.name} has checked out of "${job.title}".`,
                        { jobId: job._id }
                    );
                }
            }
        } catch (notifErr) {
            console.error('Failed to notify employer on checkout:', notifErr);
        }
        
        res.json({ message: 'Checked out successfully', job });
    } catch (error) {
        res.status(500).json({ message: 'Failed to check out', error: error.message });
    }
};
exports.checkOutJob = checkOutJob;

const getWorkerShifts = async (req, res) => {
    try {
        const jobs = await Job_1.Job.find({ worker: req.user._id })
            .populate('employer', 'name email phone')
            .sort({ date: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch shifts', error: error.message });
    }
};
exports.getWorkerShifts = getWorkerShifts;

const getJobById = async (req, res) => {
    try {
        const job = await Job_1.Job.findById(req.params.id)
            .populate('employer', 'name email phone')
            .populate('worker', 'name email phone');
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch job details', error: error.message });
    }
};
exports.getJobById = getJobById;
//# sourceMappingURL=jobController.js.map