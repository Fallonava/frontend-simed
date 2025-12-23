const satusehatWorker = require('./satusehatWorker');
const sirsWorker = require('./sirsWorker');
const sisruteWorker = require('./sisruteWorker');
const logger = require('../utils/logger');

logger.info('Starting Bridge Service Workers...');
logger.info('SATUSEHAT Worker: Active');
logger.info('SIRS Worker: Active');
logger.info('SISRUTE Worker: Active');

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, closing workers...');
    await satusehatWorker.close();
    await sirsWorker.close();
    await sisruteWorker.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, closing workers...');
    await satusehatWorker.close();
    await sirsWorker.close();
    await sisruteWorker.close();
    process.exit(0);
});
