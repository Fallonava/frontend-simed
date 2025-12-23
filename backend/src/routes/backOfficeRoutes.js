const express = require('express');
const router = express.Router();
const controller = require('../controllers/backOfficeController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Remuneration
router.post('/remuneration/process/:invoice_id', controller.processInvoiceRemuneration);

// Assets
router.get('/assets', controller.getAssetDepreciation);
router.post('/assets', controller.createAsset);

// Accounting
router.post('/accounting/journal', controller.createJournal);

// HR & Credentialing
router.post('/hr/credential-audit', controller.checkCredentialAlock);

module.exports = router;
