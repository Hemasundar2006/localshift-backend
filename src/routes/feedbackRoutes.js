const express = require('express');
const router = express.Router();
const { submitFeedback, getAllFeedbacks } = require('../controllers/feedbackController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', getAllFeedbacks);
router.post('/', protect, submitFeedback);

module.exports = router;
