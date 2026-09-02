"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vacancyController_1 = require("../controllers/vacancyController");
const authMiddleware_1 = require("../middlewares/authMiddleware");

const router = express_1.default.Router();

// Public & Candidate endpoints
router.get('/', vacancyController_1.getVacancies);
router.get('/my-applied', authMiddleware_1.protect, vacancyController_1.getMyApplications);
router.get('/my-vacancies', authMiddleware_1.protect, vacancyController_1.getCompanyVacancies);
router.get('/:id', vacancyController_1.getVacancyById);

// Company & Seeker actions
router.post('/', authMiddleware_1.protect, vacancyController_1.createVacancy);
router.put('/:id', authMiddleware_1.protect, vacancyController_1.updateVacancy);
router.delete('/:id', authMiddleware_1.protect, vacancyController_1.deleteVacancy);
router.post('/:id/apply', authMiddleware_1.protect, vacancyController_1.applyVacancy);
router.put('/:id/applicants/:applicantId/status', authMiddleware_1.protect, vacancyController_1.updateApplicantStatus);

exports.default = router;
