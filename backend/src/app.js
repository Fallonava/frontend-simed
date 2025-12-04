const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const queueController = require('./controllers/queueController');

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

// Routes
app.post('/api/quota/generate', queueController.generateQuota);
app.post('/api/quota/toggle', queueController.toggleStatus);
app.post('/api/queue/ticket', queueController.takeTicket);
app.get('/api/doctors', queueController.getDoctors); // Helper to get doctors and their status

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
