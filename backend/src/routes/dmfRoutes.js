const express = require('express');
const router = express.Router();
const dmfController = require('../controllers/dmfController');

// Template Routes
router.post('/templates', dmfController.createTemplate);
router.get('/templates', dmfController.getTemplates);
router.put('/templates/:id', dmfController.updateTemplate);

// Response Routes
router.post('/responses', dmfController.submitResponse);
router.get('/responses', dmfController.getResponses);

module.exports = router;
