const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/progress', authMiddleware, userController.updateProgress);
router.post('/update-time', authMiddleware, userController.updateTime);
router.get('/stats', authMiddleware, userController.getUserStats);
router.get('/me', authMiddleware, userController.getMe);

module.exports = router;
