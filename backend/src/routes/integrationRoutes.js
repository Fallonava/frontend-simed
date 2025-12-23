const express = require('express');
const router = express.Router();
const controller = require('../controllers/integrationController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Logs & Monitoring
router.get('/logs', controller.getLogs);
router.get('/health', controller.getIntegrationHealth);

// SATUSEHAT
router.post('/satusehat/sync', controller.triggerSatusehatSync);
router.get('/satusehat/mappings', controller.getSatusehatMappings);

// SIRS
router.post('/sirs/generate-rl', controller.generateSIRSReport);

module.exports = router;
