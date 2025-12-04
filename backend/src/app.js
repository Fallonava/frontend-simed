const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const queueController = require('./controllers/queueController');
const poliklinikController = require('./controllers/poliklinikController');
const doctorController = require('./controllers/doctorController');
const authController = require('./controllers/authController');
const analyticsController = require('./controllers/analyticsController');
const authMiddleware = require('./middleware/authMiddleware');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for now, restrict in production
        methods: ["GET", "POST"]
    }
});

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Inject io and prisma into req for controllers
app.use((req, res, next) => {
    req.io = io;
    req.prisma = prisma;
    next();
});

// Auth Routes
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', authMiddleware, authController.me);

// Analytics Routes
app.get('/api/analytics/daily', analyticsController.getDailyStats);

// Routes
app.post('/api/quota/generate', queueController.generateQuota);
app.post('/api/quota/toggle', queueController.toggleStatus);
app.post('/api/queue/ticket', queueController.takeTicket);
app.post('/api/queue/call', queueController.callNext); // Kept for backward compatibility if any
app.post('/api/queues/call', queueController.callNext); // New standard endpoint
app.get('/api/queues/waiting', queueController.getWaiting);
app.post('/api/queues/complete', queueController.completeTicket);
app.post('/api/queues/skip', queueController.skipTicket);
app.get('/api/queues/skipped', queueController.getSkipped);
app.post('/api/queues/recall-skipped', queueController.recallSkipped);
app.get('/api/doctors', queueController.getDoctors); // Helper to get doctors and their status

// Master Data Routes
app.get('/api/polies', poliklinikController.getAll);
app.post('/api/polies', poliklinikController.create);
app.put('/api/polies/:id', poliklinikController.update);
app.delete('/api/polies/:id', poliklinikController.delete);

app.get('/api/doctors-master', doctorController.getAll); // Different endpoint to avoid conflict with queueController.getDoctors
app.post('/api/doctors', doctorController.create);
app.put('/api/doctors/:id', doctorController.update);
app.delete('/api/doctors/:id', doctorController.delete);

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
