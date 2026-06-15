"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const serviceSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    provider: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true },
    averageRating: { type: Number, default: 0 }
}, {
    timestamps: true
});
exports.Service = mongoose_1.default.model('Service', serviceSchema);
//# sourceMappingURL=Service.js.map