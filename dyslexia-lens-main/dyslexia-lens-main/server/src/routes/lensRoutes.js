const express = require('express');
const router = express.Router();
const lensController = require('../controllers/lensController');
// const upload = require('../middlewares/uploadMiddleware');

// router.post('/analyze', upload.single('image'), lensController.analyzeImage);
const upload = require('../middlewares/uploadMiddleware');
router.post('/analyze-image', require('../middlewares/authMiddleware'), upload.single('file'), lensController.analyzeImage);
router.get('/:id/analyze', require('../middlewares/authMiddleware'), lensController.analyzeDocument);
router.post('/simplify', require('../middlewares/authMiddleware'), lensController.simplifyText);
router.post('/test-key', require('../middlewares/authMiddleware'), lensController.testApiKey);

module.exports = router;
