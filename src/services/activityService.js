"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const ActivityLog_1 = require("../models/ActivityLog");

/**
 * Logs a system or user activity asynchronously.
 * 
 * @param {string|null} userId - The ID of the user performing the action (can be null for system events)
 * @param {string} action - The action identifier (e.g., 'USER_LOGIN', 'JOB_CREATED')
 * @param {string} description - A human-readable description of the activity
 * @param {object} [metadata] - Optional additional data
 * @param {string} [ipAddress] - Optional IP address
 */
const logActivity = (userId, action, description, metadata = {}, ipAddress = null) => {
    // We intentionally don't await this to avoid blocking the main request thread
    ActivityLog_1.ActivityLog.create({
        user: userId,
        action,
        description,
        metadata,
        ipAddress
    }).catch(err => {
        console.error(`[ActivityLog Error] Failed to log activity ${action}:`, err);
    });
};
exports.logActivity = logActivity;
