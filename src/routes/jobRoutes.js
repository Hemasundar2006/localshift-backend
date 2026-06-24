"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jobController_1 = require("../controllers/jobController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.route('/').get(jobController_1.getJobs).post(authMiddleware_1.protect, jobController_1.createJob);
router.route('/employer').get(authMiddleware_1.protect, jobController_1.getEmployerJobs);
router.route('/worker/shifts').get(authMiddleware_1.protect, jobController_1.getWorkerShifts);
router.route('/:id/apply').post(authMiddleware_1.protect, jobController_1.applyForJob);
router.route('/:id/hire').post(authMiddleware_1.protect, jobController_1.hireWorker);
router.route('/:id/check-in').post(authMiddleware_1.protect, jobController_1.checkInJob);
router.route('/:id/check-out').post(authMiddleware_1.protect, jobController_1.checkOutJob);
router.route('/:id').get(jobController_1.getJobById);

exports.default = router;
//# sourceMappingURL=jobRoutes.js.map