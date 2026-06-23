"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'seeker', 'employer'], default: 'seeker' },
    dob: { type: Date },
    shopName: { type: String },
    shopAddress: { type: String },
    isPhoneVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    pushToken: { type: String },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    bio: { type: String },
    skills: { type: [String], default: [] },
    coins: { type: Number, default: 150 },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});
userSchema.index({ location: '2dsphere' });
userSchema.pre('save', async function () {
    if (!this.isModified('password'))
        return;
    const salt = await bcryptjs_1.default.genSalt(10);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
});
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcryptjs_1.default.compare(enteredPassword, this.password);
};
exports.User = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=User.js.map