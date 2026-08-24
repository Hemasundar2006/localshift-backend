"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailOTP = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));

const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // Needs to be an App Password
    },
});

const sendEmailOTP = async (to, otp) => {
    try {
        const mailOptions = {
            from: `"LocalShift" <${process.env.GMAIL_USER}>`,
            to,
            subject: 'Your LocalShift Verification Code',
            text: `Welcome to LocalShift!\n\nYour verification code is: ${otp}\n\nIt is valid for 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #4F46E5; text-align: center;">LocalShift Verification</h2>
                    <p style="font-size: 16px; color: #333;">Welcome to LocalShift!</p>
                    <p style="font-size: 16px; color: #333;">Your verification code is:</p>
                    <div style="background-color: #f4f4f5; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #111;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #666;">This code is valid for 10 minutes.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
exports.sendEmailOTP = sendEmailOTP;
