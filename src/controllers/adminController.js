"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteJobByAdmin = exports.updateJobByAdmin = exports.getAllJobs = exports.deleteVacancyByAdmin = exports.updateVacancyByAdmin = exports.getAllVacancies = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.getOverviewStats = exports.getActivities = void 0;

const ActivityLog_1 = require("../models/ActivityLog");
const User_1 = require("../models/User");
const Job_1 = require("../models/Job");
const Vacancy_1 = require("../models/Vacancy");
const activityService_1 = require("../services/activityService");

// ─── GET /api/admin/overview ───────────────────────────────────────────────────────
const getOverviewStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalSeekers,
            totalEmployers,
            totalCompanies,
            totalAdmins,
            totalJobs,
            activeJobs,
            totalVacancies,
            activeVacancies,
            recentActivities
        ] = await Promise.all([
            User_1.User.countDocuments(),
            User_1.User.countDocuments({ role: 'seeker' }),
            User_1.User.countDocuments({ role: 'employer' }),
            User_1.User.countDocuments({ role: 'company' }),
            User_1.User.countDocuments({ role: 'admin' }),
            Job_1.Job.countDocuments(),
            Job_1.Job.countDocuments({ status: { $in: ['open', 'assigned', 'in-progress'] } }),
            Vacancy_1.Vacancy.countDocuments(),
            Vacancy_1.Vacancy.countDocuments({ status: 'active' }),
            ActivityLog_1.ActivityLog.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email role')
        ]);

        // Calculate total vacancy applicants
        const vacancyAggregate = await Vacancy_1.Vacancy.aggregate([
            { $project: { applicantCount: { $size: { $ifNull: ['$applicants', []] } } } },
            { $group: { _id: null, totalApplicants: { $sum: '$applicantCount' } } }
        ]);
        const totalVacancyApplicants = vacancyAggregate[0]?.totalApplicants || 0;

        res.json({
            metrics: {
                users: {
                    total: totalUsers,
                    seekers: totalSeekers,
                    employers: totalEmployers,
                    companies: totalCompanies,
                    admins: totalAdmins
                },
                shifts: {
                    total: totalJobs,
                    active: activeJobs
                },
                vacancies: {
                    total: totalVacancies,
                    active: activeVacancies,
                    totalApplicants: totalVacancyApplicants
                }
            },
            recentActivities
        });
    } catch (error) {
        console.error('getOverviewStats error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getOverviewStats = getOverviewStats;

// ─── GET /api/admin/users ──────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
    try {
        const { role, search, status, page, limit } = req.query;
        const filter = {};

        if (role && role !== 'all') {
            filter.role = role;
        }

        if (status && status !== 'all') {
            filter.accountStatus = status;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { shopName: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } }
            ];
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        const users = await User_1.User.find(filter)
            .select('-password -otp')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await User_1.User.countDocuments(filter);

        res.json({
            users,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('getAllUsers error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getAllUsers = getAllUsers;

// ─── GET /api/admin/users/:id ──────────────────────────────────────────────────────
const getUserById = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id).select('-password -otp');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        let extraData = {};
        if (user.role === 'employer') {
            extraData.postedJobs = await Job_1.Job.find({ employer: user._id }).sort({ createdAt: -1 });
        } else if (user.role === 'company') {
            extraData.postedVacancies = await Vacancy_1.Vacancy.find({ company: user._id }).sort({ createdAt: -1 });
        } else if (user.role === 'seeker') {
            extraData.appliedJobs = await Job_1.Job.find({ applicants: user._id });
            extraData.appliedVacancies = await Vacancy_1.Vacancy.find({ 'applicants.applicant': user._id });
        }

        const activities = await ActivityLog_1.ActivityLog.find({ user: user._id }).sort({ createdAt: -1 }).limit(20);

        res.json({
            user,
            ...extraData,
            activities
        });
    } catch (error) {
        console.error('getUserById error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getUserById = getUserById;

// ─── PUT /api/admin/users/:id ──────────────────────────────────────────────────────
const updateUser = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const allowedFields = [
            'name', 'email', 'phone', 'role', 'dob', 'shopName', 'shopAddress',
            'companyName', 'companyWebsite', 'companyIndustry', 'companySize',
            'companyDescription', 'companyAddress', 'companyLogo', 'isVerified', 'accountStatus',
            'coins', 'earnCoins', 'bio', 'skills'
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
            }
        });

        await user.save();

        (0, activityService_1.logActivity)(req.user._id.toString(), 'ADMIN_USER_UPDATED', `Admin updated user: ${user.email}`, { targetUserId: user._id });

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('updateUser error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateUser = updateUser;

// ─── DELETE /api/admin/users/:id ───────────────────────────────────────────────────
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (user._id.toString() === req.user._id.toString()) {
            res.status(400).json({ message: 'You cannot delete your own admin account' });
            return;
        }

        await User_1.User.findByIdAndDelete(req.params.id);

        (0, activityService_1.logActivity)(req.user._id.toString(), 'ADMIN_USER_DELETED', `Admin deleted user: ${user.email}`, { targetUserId: user._id });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('deleteUser error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.deleteUser = deleteUser;

// ─── GET /api/admin/vacancies ──────────────────────────────────────────────────────
const getAllVacancies = async (req, res) => {
    try {
        const { search, status, page, limit } = req.query;
        const filter = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        const vacancies = await Vacancy_1.Vacancy.find(filter)
            .populate('company', 'name email phone companyName isVerified')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Vacancy_1.Vacancy.countDocuments(filter);

        res.json({
            vacancies,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('getAllVacancies error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getAllVacancies = getAllVacancies;

// ─── PUT /api/admin/vacancies/:id ──────────────────────────────────────────────────
const updateVacancyByAdmin = async (req, res) => {
    try {
        const vacancy = await Vacancy_1.Vacancy.findById(req.params.id);
        if (!vacancy) {
            res.status(404).json({ message: 'Vacancy not found' });
            return;
        }

        Object.assign(vacancy, req.body);
        await vacancy.save();

        (0, activityService_1.logActivity)(req.user._id.toString(), 'ADMIN_VACANCY_UPDATED', `Admin updated vacancy: ${vacancy.title}`, { vacancyId: vacancy._id });

        res.json({ message: 'Vacancy updated successfully', vacancy });
    } catch (error) {
        console.error('updateVacancyByAdmin error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateVacancyByAdmin = updateVacancyByAdmin;

// ─── DELETE /api/admin/vacancies/:id ───────────────────────────────────────────────
const deleteVacancyByAdmin = async (req, res) => {
    try {
        const vacancy = await Vacancy_1.Vacancy.findByIdAndDelete(req.params.id);
        if (!vacancy) {
            res.status(404).json({ message: 'Vacancy not found' });
            return;
        }

        (0, activityService_1.logActivity)(req.user._id.toString(), 'ADMIN_VACANCY_DELETED', `Admin deleted vacancy: ${vacancy.title}`, { vacancyId: req.params.id });

        res.json({ message: 'Vacancy removed successfully by admin' });
    } catch (error) {
        console.error('deleteVacancyByAdmin error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.deleteVacancyByAdmin = deleteVacancyByAdmin;

// ─── GET /api/admin/jobs ───────────────────────────────────────────────────────────
const getAllJobs = async (req, res) => {
    try {
        const { search, status, page, limit } = req.query;
        const filter = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { shopName: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        const jobs = await Job_1.Job.find(filter)
            .populate('employer', 'name email phone shopName')
            .populate('worker', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Job_1.Job.countDocuments(filter);

        res.json({
            jobs,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('getAllJobs error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getAllJobs = getAllJobs;

// ─── PUT /api/admin/jobs/:id ───────────────────────────────────────────────────────
const updateJobByAdmin = async (req, res) => {
    try {
        const job = await Job_1.Job.findById(req.params.id);
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }

        Object.assign(job, req.body);
        await job.save();

        (0, activityService_1.logActivity)(req.user._id.toString(), 'ADMIN_JOB_UPDATED', `Admin updated job: ${job.title}`, { jobId: job._id });

        res.json({ message: 'Job updated successfully', job });
    } catch (error) {
        console.error('updateJobByAdmin error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateJobByAdmin = updateJobByAdmin;

// ─── DELETE /api/admin/jobs/:id ────────────────────────────────────────────────────
const deleteJobByAdmin = async (req, res) => {
    try {
        const job = await Job_1.Job.findByIdAndDelete(req.params.id);
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }

        (0, activityService_1.logActivity)(req.user._id.toString(), 'ADMIN_JOB_DELETED', `Admin deleted job: ${job.title}`, { jobId: req.params.id });

        res.json({ message: 'Job shift deleted successfully by admin' });
    } catch (error) {
        console.error('deleteJobByAdmin error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.deleteJobByAdmin = deleteJobByAdmin;

// ─── GET /api/admin/activities ─────────────────────────────────────────────────────
const getActivities = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.action) filter.action = req.query.action;
        if (req.query.userId) filter.user = req.query.userId;

        const activities = await ActivityLog_1.ActivityLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'name email role shopName companyName phone');

        const total = await ActivityLog_1.ActivityLog.countDocuments(filter);

        res.json({
            activities,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('getActivities error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getActivities = getActivities;
