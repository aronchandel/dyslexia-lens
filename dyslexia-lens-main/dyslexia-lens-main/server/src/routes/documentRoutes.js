const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middlewares/authMiddleware'); // corrected path
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', authMiddleware, upload.single('file'), documentController.uploadDocument);
router.get('/', authMiddleware, documentController.getDocuments);
router.get('/:id', authMiddleware, documentController.getDocumentById);
router.get('/:id/content', authMiddleware, documentController.getDocumentContent);
router.delete('/:id', authMiddleware, documentController.deleteDocument);
router.put('/:id/progress', authMiddleware, documentController.updateProgress);

module.exports = router;
