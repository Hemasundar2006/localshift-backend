const { Feedback } = require('../models/Feedback');

// @desc    Submit feedback for a job application
// @route   POST /api/feedback
// @access  Private (Seeker)
const submitFeedback = async (req, res) => {
    try {
        const { jobId, rating, comment } = req.body;
        const userId = req.user.id;

        if (!jobId || !rating || !comment) {
            return res.status(400).json({ message: 'Job ID, rating, and comment are required' });
        }

        const feedback = await Feedback.create({
            user: userId,
            job: jobId,
            rating: Number(rating),
            comment
        });

        res.status(201).json(feedback);
    } catch (error) {
        console.error('submitFeedback error:', error);
        res.status(500).json({ message: 'Failed to submit feedback' });
    }
};

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Public
const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate('user', 'name role')
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(feedbacks);
    } catch (error) {
        console.error('getAllFeedbacks error:', error);
        res.status(500).json({ message: 'Failed to fetch feedbacks' });
    }
};

module.exports = {
    submitFeedback,
    getAllFeedbacks
};
