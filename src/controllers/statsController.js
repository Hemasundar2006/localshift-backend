"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = void 0;
const User_1 = require("../models/User");
const Job_1 = require("../models/Job");

const getStats = async (req, res) => {
    try {
        const totalUsers = await User_1.User.countDocuments({});
        const seekersCount = await User_1.User.countDocuments({ role: 'seeker' });
        const employersCount = await User_1.User.countDocuments({ role: 'employer' });
        const adminsCount = await User_1.User.countDocuments({ role: 'admin' });

        const totalJobs = await Job_1.Job.countDocuments({});
        const openJobs = await Job_1.Job.countDocuments({ status: 'open' });
        const assignedJobs = await Job_1.Job.countDocuments({ status: 'assigned' });
        const inProgressJobs = await Job_1.Job.countDocuments({ status: 'in-progress' });
        const completedJobs = await Job_1.Job.countDocuments({ status: 'completed' });
        const cancelledJobs = await Job_1.Job.countDocuments({ status: 'cancelled' });

        // Successful hiring counts: 
        // 1. Where a worker has been hired (assigned, in-progress, or completed)
        // 2. Just completed hirings
        const totalHired = await Job_1.Job.countDocuments({ worker: { $ne: null } });

        res.json({
            users: {
                total: totalUsers,
                seekers: seekersCount,
                employers: employersCount,
                admins: adminsCount
            },
            jobs: {
                total: totalJobs,
                open: openJobs,
                assigned: assignedJobs,
                inProgress: inProgressJobs,
                completed: completedJobs,
                cancelled: cancelledJobs
            },
            successHiring: {
                completedCount: completedJobs,
                totalHiredCount: totalHired
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
    }
};
exports.getStats = getStats;
