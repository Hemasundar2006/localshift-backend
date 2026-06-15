"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const jobSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    employer: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    worker: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }, // Assigned later
    applicants: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
    payRate: { type: Number, required: true },
    status: {
        type: String,
        enum: ['open', 'assigned', 'in-progress', 'completed', 'cancelled'],
        default: 'open'
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    location: { type: String, required: true },
    coordinates: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    }
}, {
    timestamps: true
});
jobSchema.index({ coordinates: '2dsphere' });
exports.Job = mongoose_1.default.model('Job', jobSchema);
//# sourceMappingURL=Job.js.map