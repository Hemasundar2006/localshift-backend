"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobs = exports.createJob = void 0;
const Job_1 = require("../models/Job");
// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private
const createJob = async (req, res) => {
    const { title, description, payRate, date, startTime, endTime, location } = req.body;
    try {
        const job = new Job_1.Job({
            employer: req.user._id,
            title,
            description,
            payRate,
            date,
            startTime,
            endTime,
            location
        });
        const createdJob = await job.save();
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