"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivities = void 0;
const ActivityLog_1 = require("../models/ActivityLog");

// ─── GET /api/admin/activities ──────────────────────────────────────────────────
const getActivities = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const filter = {};
        
        // Optional filters
        if (req.query.action) filter.action = req.query.action;
        if (req.query.userId) filter.user = req.query.userId;
        
        const activities = await ActivityLog_1.ActivityLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'name email role shopName phone');
            
        const total = await ActivityLog_1.ActivityLog.countDocuments(filter);

        res.json({
            activities,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('getActivities error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getActivities = getActivities;
