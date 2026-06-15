"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readAllNotifications = exports.readNotification = exports.getNotifications = void 0;
const Notification_1 = require("../models/Notification");
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification_1.Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
};
exports.getNotifications = getNotifications;
const readNotification = async (req, res) => {
    try {
        const notification = await Notification_1.Notification.findOne({ _id: req.params.id, user: req.user._id });
        if (notification) {
            notification.read = true;
            await notification.save();
            res.json(notification);
        }
        else {
            res.status(404).json({ message: 'Notification not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update notification', error: error.message });
    }
};
exports.readNotification = readNotification;
const readAllNotifications = async (req, res) => {
    try {
        await Notification_1.Notification.updateMany({ user: req.user._id, read: false }, { read: true });
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update notifications', error: error.message });
    }
};
exports.readAllNotifications = readAllNotifications;
//# sourceMappingURL=notificationController.js.map
