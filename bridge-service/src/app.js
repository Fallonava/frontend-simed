const express = require('express');
const cors = require('cors');
const { createBullBoard } = require('@bull-board/express');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { satusehatQueue } = require('./queues/satusehatQueue');
const { sirsQueue } = require('./queues/sirsQueue');
const { sisruteQueue } = require('./queues/sisruteQueue');
const logger = require('./utils/logger');

require('dotenv').config();

const app = express();
const PORT = process.env.BRIDGE_PORT || 4000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Fallonava Bridge Service',
        timestamp: new Date().toISOString()
    });
});

// Bull Board - Queue Monitoring Dashboard
const serverAdapter = createBullBoard({
    queues: [
        new BullMQAdapter(satusehatQueue),
        new BullMQAdapter(sirsQueue),
        new BullMQAdapter(sisruteQueue)
    ],
    serverAdapter: serverAdapter
});

serverAdapter.setBasePath('/admin/queues');
app.use('/admin/queues', serverAdapter.getRouter());

// Manual Trigger Endpoints
app.post('/trigger/satusehat/sync', async (req, res) => {
    try {
        const { resourceType, resourceId } = req.body;
        await satusehatQueue.add('sync-resource', { resourceType, resourceId });
        res.json({ message: 'SATUSEHAT sync job queued' });
    } catch (error) {
        logger.error('Failed to queue SATUSEHAT job', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/trigger/sirs/generate-rl', async (req, res) => {
    try {
        const { reportType, month, year } = req.body;
        await sirsQueue.add('generate-rl', { reportType, month, year });
        res.json({ message: 'SIRS RL generation queued' });
    } catch (error) {
        logger.error('Failed to queue SIRS job', error);
        res.status(500).json({ error: error.message });
    }
});

// SISRUTE Incoming Webhook
app.post('/webhook/sisrute/incoming-referral', async (req, res) => {
    try {
        const referralData = req.body;
        await sisruteQueue.add('process-incoming-referral', referralData);
        res.json({ message: 'Referral received and queued' });
    } catch (error) {
        logger.error('Failed to process SISRUTE webhook', error);
        res.status(500).json({ error: error.message });
    }
});

// Error Handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    logger.info(`Bridge Service running on port ${PORT}`);
    logger.info(`Queue Dashboard: http://localhost:${PORT}/admin/queues`);
});

module.exports = app;
