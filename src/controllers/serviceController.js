"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServices = exports.createService = void 0;
const Service_1 = require("../models/Service");
// @desc    Create a new service
// @route   POST /api/services
// @access  Private
const createService = async (req, res) => {
    const { title, description, category, price } = req.body;
    try {
        const service = new Service_1.Service({
            provider: req.user._id,
            title,
            description,
            category,
            price
        });
        const createdService = await service.save();
        res.status(201).json(createdService);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create service', error: error.message });
    }
};
exports.createService = createService;
// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
    try {
        const services = await Service_1.Service.find({}).populate('provider', 'name email');
        res.json(services);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch services' });
    }
};
exports.getServices = getServices;
//# sourceMappingURL=serviceController.js.map