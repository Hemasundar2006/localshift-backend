"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApplicantStatus = exports.getMyApplications = exports.applyVacancy = exports.deleteVacancy = exports.updateVacancy = exports.getVacancyById = exports.getCompanyVacancies = exports.getVacancies = exports.createVacancy = void 0;

const Vacancy_1 = require("../models/Vacancy");
const User_1 = require("../models/User");
const activityService_1 = require("../services/activityService");
const notificationService_1 = require("../services/notificationService");

// ─── POST /api/vacancies ──────────────────────────────────────────────────────────
const createVacancy = async (req, res) => {
    try {
        if (!req.user || (req.user.role !== 'company' && req.user.role !== 'admin')) {
            res.status(403).json({ message: 'Only companies and admins can post full-time vacancies' });
            return;
        }

        const {
            title,
            location,
            minSalary,
            maxSalary,
            experience,
            openings,
            skills,
            description
        } = req.body;

        if (!title || !description || !location || minSalary === undefined || maxSalary === undefined) {
            res.status(400).json({ message: 'Title, description, location, and salary range are required' });
            return;
        }

        const companyName = req.user.companyName || req.user.name;
        const companyLogo = req.user.companyLogo || req.user.avatarUrl || '';

        const vacancy = await Vacancy_1.Vacancy.create({
            title,
            company: req.user._id,
            companyName,
            companyLogo,
            location,
            minSalary: Number(minSalary),
            maxSalary: Number(maxSalary),
            experience: experience || 'Fresher',
            openings: Number(openings) || 1,
            skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s) => s.trim()) : []),
            description
        });

        (0, activityService_1.logActivity)(req.user._id.toString(), 'VACANCY_CREATED', `Vacancy posted: ${title} at ${companyName}`, { vacancyId: vacancy._id });

        res.status(201).json(vacancy);
    } catch (error) {
        console.error('createVacancy error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.createVacancy = createVacancy;

// ─── GET /api/vacancies ───────────────────────────────────────────────────────────
const getVacancies = async (req, res) => {
    try {
        const { search, experience, minSalary, status, page, limit } = req.query;
        const query = {};

        if (status) {
            query.status = status;
        } else {
            query.status = 'active'; // Default only active
        }

        if (experience && experience !== 'all') {
            query.experience = { $regex: new RegExp(experience, 'i') };
        }

        if (minSalary) {
            query.maxSalary = { $gte: Number(minSalary) };
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { skills: { $elemMatch: { $regex: search, $options: 'i' } } }
            ];
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        const vacancies = await Vacancy_1.Vacancy.find(query)
            .populate('company', 'name email phone companyName companyWebsite companyLogo isVerified')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Vacancy_1.Vacancy.countDocuments(query);

        res.json({
            vacancies,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('getVacancies error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getVacancies = getVacancies;

// ─── GET /api/vacancies/my ────────────────────────────────────────────────────────
const getCompanyVacancies = async (req, res) => {
    try {
        if (!req.user || (req.user.role !== 'company' && req.user.role !== 'admin')) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        const query = req.user.role === 'admin' && req.query.companyId
            ? { company: req.query.companyId }
            : { company: req.user._id };

        const vacancies = await Vacancy_1.Vacancy.find(query)
            .populate('applicants.applicant', 'name email phone avatarUrl resumeUrl bio skills')
            .sort({ createdAt: -1 });

        res.json(vacancies);
    } catch (error) {
        console.error('getCompanyVacancies error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getCompanyVacancies = getCompanyVacancies;

// ─── GET /api/vacancies/:id ───────────────────────────────────────────────────────
const getVacancyById = async (req, res) => {
    try {
        const vacancy = await Vacancy_1.Vacancy.findById(req.params.id)
            .populate('company', 'name email phone companyName companyWebsite companyLogo companyDescription isVerified')
            .populate('applicants.applicant', 'name email phone avatarUrl resumeUrl bio skills');

        if (!vacancy) {
            res.status(404).json({ message: 'Vacancy not found' });
            return;
        }

        res.json(vacancy);
    } catch (error) {
        console.error('getVacancyById error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getVacancyById = getVacancyById;

// ─── PUT /api/vacancies/:id ───────────────────────────────────────────────────────
const updateVacancy = async (req, res) => {
    try {
        const vacancy = await Vacancy_1.Vacancy.findById(req.params.id);
        if (!vacancy) {
            res.status(404).json({ message: 'Vacancy not found' });
            return;
        }

        if (req.user.role !== 'admin' && vacancy.company.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'Not authorized to edit this vacancy' });
            return;
        }

        const allowedFields = [
            'title', 'location', 'minSalary', 'maxSalary', 'experience', 'openings',
            'skills', 'description', 'status'
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                vacancy[field] = req.body[field];
            }
        });

        await vacancy.save();

        (0, activityService_1.logActivity)(req.user._id.toString(), 'VACANCY_UPDATED', `Vacancy updated: ${vacancy.title}`, { vacancyId: vacancy._id });

        res.json(vacancy);
    } catch (error) {
        console.error('updateVacancy error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateVacancy = updateVacancy;

// ─── DELETE /api/vacancies/:id ────────────────────────────────────────────────────
const deleteVacancy = async (req, res) => {
    try {
        const vacancy = await Vacancy_1.Vacancy.findById(req.params.id);
        if (!vacancy) {
            res.status(404).json({ message: 'Vacancy not found' });
            return;
        }

        if (req.user.role !== 'admin' && vacancy.company.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'Not authorized to delete this vacancy' });
            return;
        }

        await Vacancy_1.Vacancy.findByIdAndDelete(req.params.id);

        (0, activityService_1.logActivity)(req.user._id.toString(), 'VACANCY_DELETED', `Vacancy deleted: ${vacancy.title}`, { vacancyId: vacancy._id });

        res.json({ message: 'Vacancy removed successfully' });
    } catch (error) {
        console.error('deleteVacancy error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.deleteVacancy = deleteVacancy;

// ─── POST /api/vacancies/:id/apply ────────────────────────────────────────────────
const applyVacancy = async (req, res) => {
    try {
        const vacancy = await Vacancy_1.Vacancy.findById(req.params.id);
        if (!vacancy) {
            res.status(404).json({ message: 'Vacancy not found' });
            return;
        }

        if (vacancy.status !== 'active') {
            res.status(400).json({ message: 'This vacancy is no longer accepting applications' });
            return;
        }

        // Check if already applied
        const alreadyApplied = vacancy.applicants.some(
            (app) => app.applicant.toString() === req.user._id.toString()
        );

        if (alreadyApplied) {
            res.status(400).json({ message: 'You have already applied for this vacancy' });
            return;
        }

        const application = {
            applicant: req.user._id,
            appliedAt: new Date(),
            status: 'applied',
            resumeUrl: req.body.resumeUrl || req.user.resumeUrl || ''
        };

        vacancy.applicants.push(application);
        await vacancy.save();

        (0, activityService_1.logActivity)(req.user._id.toString(), 'VACANCY_APPLIED', `Applied for ${vacancy.title} at ${vacancy.companyName}`, { vacancyId: vacancy._id });

        // Notify the company
        const companyUser = await User_1.User.findById(vacancy.company);
        if (companyUser && companyUser.pushToken && companyUser.pushEnabled) {
            (0, notificationService_1.sendPushNotification)(
                companyUser.pushToken,
                'New Applicant!',
                `${req.user.name} applied for ${vacancy.title}`,
                { vacancyId: vacancy._id.toString() }
            );
        }

        res.status(201).json({ message: 'Application submitted successfully!', vacancyId: vacancy._id });
    } catch (error) {
        console.error('applyVacancy error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.applyVacancy = applyVacancy;

// ─── GET /api/vacancies/applied/my ────────────────────────────────────────────────
const getMyApplications = async (req, res) => {
    try {
        const vacancies = await Vacancy_1.Vacancy.find({
            'applicants.applicant': req.user._id
        }).populate('company', 'name email phone companyName companyLogo isVerified');

        const result = vacancies.map((vac) => {
            const myApp = vac.applicants.find(
                (app) => app.applicant.toString() === req.user._id.toString()
            );
            return {
                vacancy: {
                    _id: vac._id,
                    title: vac.title,
                    companyName: vac.companyName,
                    companyLogo: vac.companyLogo,
                    location: vac.location,
                    minSalary: vac.minSalary,
                    maxSalary: vac.maxSalary,
                    experience: vac.experience,
                    status: vac.status,
                    company: vac.company
                },
                application: myApp
            };
        });

        res.json(result);
    } catch (error) {
        console.error('getMyApplications error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getMyApplications = getMyApplications;

// ─── PUT /api/vacancies/:id/applicants/:applicantId/status ──────────────────────
const updateApplicantStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['applied', 'shortlisted', 'rejected', 'hired'].includes(status)) {
            res.status(400).json({ message: 'Invalid status' });
            return;
        }

        const vacancy = await Vacancy_1.Vacancy.findById(req.params.id);
        if (!vacancy) {
            res.status(404).json({ message: 'Vacancy not found' });
            return;
        }

        if (req.user.role !== 'admin' && vacancy.company.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        const appItem = vacancy.applicants.id(req.params.applicantId);
        if (!appItem) {
            res.status(404).json({ message: 'Applicant record not found' });
            return;
        }

        appItem.status = status;
        await vacancy.save();

        // Notify applicant of status change
        const applicantUser = await User_1.User.findById(appItem.applicant);
        if (applicantUser && applicantUser.pushToken && applicantUser.pushEnabled) {
            let statusText = status.toUpperCase();
            if (status === 'shortlisted') statusText = 'Shortlisted! 🎉';
            if (status === 'hired') statusText = 'Hired! 🌟 Congratulations!';
            (0, notificationService_1.sendPushNotification)(
                applicantUser.pushToken,
                'Application Update',
                `Your application for ${vacancy.title} at ${vacancy.companyName} was updated to: ${statusText}`,
                { vacancyId: vacancy._id.toString(), status }
            );
        }

        res.json({ message: 'Applicant status updated successfully', applicant: appItem });
    } catch (error) {
        console.error('updateApplicantStatus error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateApplicantStatus = updateApplicantStatus;
