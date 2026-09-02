"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vacancy = void 0;
const mongoose_1 = __importDefault(require("mongoose"));

const applicantSchema = new mongoose_1.default.Schema({
    applicant: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    appliedAt: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['applied', 'shortlisted', 'rejected', 'hired'],
        default: 'applied'
    },
    resumeUrl: { type: String }
}, { _id: true });

const vacancySchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    company: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, required: true },
    companyLogo: { type: String },
    location: { type: String, required: true },
    minSalary: { type: Number, required: true },
    maxSalary: { type: Number, required: true },
    experience: { type: String, default: 'Fresher' },
    openings: { type: Number, default: 1 },
    skills: { type: [String], default: [] },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active'
    },
    applicants: [applicantSchema]
}, {
    timestamps: true
});

vacancySchema.index({ title: 'text', description: 'text', companyName: 'text', location: 'text' });

exports.Vacancy = mongoose_1.default.model('Vacancy', vacancySchema);
