const express = require('express');
const router = express.Router();
const teachingController = require('../controllers/teachingController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/records/:id/verify', teachingController.verifyRecord);
router.get('/logbook', teachingController.getLogbook);
router.post('/assessments', teachingController.createAssessment);
router.get('/research-export', teachingController.getAnonymizedData);

module.exports = router;
