"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSmsNotification = void 0;
const textbee_1 = require("../services/textbee");
const sendSmsNotification = async (req, res) => {
    try {
        const { to, message } = req.body;
        if (!to || !message) {
            res.status(400).json({ error: 'Recipient "to" and "message" are required' });
            return;
        }
        const result = await (0, textbee_1.sendSMS)(to, message);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to send SMS via Textbee' });
    }
};
exports.sendSmsNotification = sendSmsNotification;
//# sourceMappingURL=smsController.js.map