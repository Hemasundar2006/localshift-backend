"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppVersion = void 0;

const getAppVersion = async (req, res) => {
    try {
        res.json({
            minVersion: "1.0.0",
            latestVersion: "1.0.1",
            updateUrl: "market://details?id=com.localshift"
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getAppVersion = getAppVersion;
