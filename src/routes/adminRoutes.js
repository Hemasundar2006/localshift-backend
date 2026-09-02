"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middlewares/authMiddleware");

const router = express_1.default.Router();

// Middleware to check for admin role
const adminProtect = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

router.use(authMiddleware_1.protect, adminProtect);

// Overview & Metrics
router.get('/overview', adminController_1.getOverviewStats);

// User Management
router.get('/users', adminController_1.getAllUsers);
router.get('/users/:id', adminController_1.getUserById);
router.put('/users/:id', adminController_1.updateUser);
router.delete('/users/:id', adminController_1.deleteUser);

// Vacancies Moderation
router.get('/vacancies', adminController_1.getAllVacancies);
router.put('/vacancies/:id', adminController_1.updateVacancyByAdmin);
router.delete('/vacancies/:id', adminController_1.deleteVacancyByAdmin);

// Shifts / Jobs Moderation
router.get('/jobs', adminController_1.getAllJobs);
router.put('/jobs/:id', adminController_1.updateJobByAdmin);
router.delete('/jobs/:id', adminController_1.deleteJobByAdmin);

// System Activities
router.get('/activities', adminController_1.getActivities);

exports.default = router;
