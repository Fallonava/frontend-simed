const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

const BRIDGE_SERVICE_URL = process.env.BRIDGE_SERVICE_URL || 'http://localhost:4000';

// Get integration logs
exports.getLogs = async (req, res) => {
    try {
        const { system, status, limit = 50 } = req.query;

        const logs = await prisma.integrationLog.findMany({
            where: {
                ...(system && { system }),
                ...(status && { status })
            },
            orderBy: { created_at: 'desc' },
            take: parseInt(limit)
        });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Trigger SATUSEHAT sync
exports.triggerSatusehatSync = async (req, res) => {
    try {
        const { resourceType, resourceId } = req.body;

        if (!resourceType || !resourceId) {
            return res.status(400).json({ error: 'resourceType and resourceId are required' });
        }

        // Send to bridge service
        const response = await axios.post(`${BRIDGE_SERVICE_URL}/trigger/satusehat/sync`, {
            resourceType,
            resourceId
        });

        res.json({
            message: 'Sync job queued',
            bridgeResponse: response.data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Generate SIRS RL Report
exports.generateSIRSReport = async (req, res) => {
    try {
        const { reportType, month, year } = req.body;

        if (!reportType || !month || !year) {
            return res.status(400).json({ error: 'reportType, month, and year are required' });
        }

        const response = await axios.post(`${BRIDGE_SERVICE_URL}/trigger/sirs/generate-rl`, {
            reportType,
            month,
            year
        });

        res.json({
            message: 'Report generation queued',
            bridgeResponse: response.data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get SATUSEHAT resource mappings
exports.getSatusehatMappings = async (req, res) => {
    try {
        const { resourceType } = req.query;

        const mappings = await prisma.satusehatResource.findMany({
            where: resourceType ? { resource_type: resourceType } : {},
            orderBy: { last_synced: 'desc' },
            take: 100
        });

        res.json(mappings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Check integration health
exports.getIntegrationHealth = async (req, res) => {
    try {
        // Get last 24 hours stats
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const stats = await prisma.integrationLog.groupBy({
            by: ['system', 'status'],
            where: {
                created_at: { gte: oneDayAgo }
            },
            _count: true
        });

        const health = {};
        stats.forEach(stat => {
            if (!health[stat.system]) {
                health[stat.system] = { SUCCESS: 0, FAILED: 0, PENDING: 0 };
            }
            health[stat.system][stat.status] = stat._count;
        });

        res.json({
            period: '24h',
            stats: health,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
