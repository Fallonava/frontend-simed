const express = require('express');
const router = express.Router();
const controller = require('../controllers/medicalSupportController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// PA
router.post('/pa/receive', controller.receiveSample);
router.put('/pa/workflow/:id', controller.updateWorkflow);

// Blood Bank
router.get('/blood/inventory', controller.getBloodInventory);
router.post('/blood/crossmatch', controller.crossmatch);

// CSSD
router.post('/cssd/track', controller.updateSetStatus);

module.exports = router;
