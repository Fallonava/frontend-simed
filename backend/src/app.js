const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');

// ... Controllers imports ...
const queueController = require('./controllers/queueController');
const poliklinikController = require('./controllers/poliklinikController');
const doctorController = require('./controllers/doctorController');
const counterController = require('./controllers/counterController');
const authController = require('./controllers/authController');
const analyticsController = require('./controllers/analyticsController');
const userController = require('./controllers/userController');
const authMiddleware = require('./middleware/authMiddleware');

require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Security & Performance Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://static.cloudflareinsights.com"],
            connectSrc: ["'self'", "https://cloudflareinsights.com"],
        },
    },
}));
app.use(compression());
app.use(morgan('dev')); // Log requests

app.get('/', (req, res) => {
    res.json({ message: "Hospital API is running", status: "OK", timestamp: new Date() });
});

const defaultOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "https://frontend-simed.vercel.app", "http://13.210.197.247"];
const envOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];

const checkOrigin = (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = [...defaultOrigins, ...envOrigins];
    if (allowed.includes(origin) || origin.startsWith('http://192.168.') || origin.startsWith('http://172.') || origin.startsWith('http://10.')) {
        callback(null, true);
    } else {
        callback(new Error('Not allowed by CORS'));
    }
};

const io = new Server(server, {
    cors: {
        origin: checkOrigin,
        methods: ["GET", "POST"]
    }
});

const prisma = new PrismaClient();

app.use(cors({
    origin: checkOrigin,
    credentials: true
}));
app.use(express.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const upload = require('./middleware/upload');
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.filename });
});

// Inject io and prisma into req for controllers
app.use((req, res, next) => {
    req.io = io;
    req.prisma = prisma;
    next();
});

// Auth Routes
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', authMiddleware, authController.me);

// User Management Routes
app.get('/api/users', authMiddleware, userController.getAll);
app.post('/api/users', authMiddleware, userController.create);
app.put('/api/users/:id', authMiddleware, userController.update);
app.delete('/api/users/:id', authMiddleware, userController.delete);

// Analytics Routes
app.get('/api/analytics/daily', analyticsController.getDailyStats);

// Patient Routes
const patientController = require('./controllers/patientController');
app.get('/api/patients/search', authMiddleware, patientController.search);
app.post('/api/patients', authMiddleware, patientController.create);
app.get('/api/patients', authMiddleware, patientController.getAll);           // New
app.get('/api/patients/:id', authMiddleware, patientController.getById);      // New
app.put('/api/patients/:id', authMiddleware, patientController.update);       // New
app.delete('/api/patients/:id', authMiddleware, patientController.delete);    // New

// Queue Routes
app.post('/api/quota/generate', queueController.generateQuota);
app.post('/api/quota/toggle', queueController.toggleStatus);
app.post('/api/queue/ticket', queueController.takeTicket);
app.get('/api/queue/ticket/:id', queueController.getTicket);
app.post('/api/queue/call', queueController.callNext); // Kept for backward compatibility if any
app.post('/api/queues/call', queueController.callNext); // New standard endpoint
app.get('/api/queues/waiting', queueController.getWaiting);
app.post('/api/queues/complete', queueController.completeTicket);
app.post('/api/queues/skip', queueController.skipTicket);
app.get('/api/queues/skipped', queueController.getSkipped);
app.post('/api/queues/recall-skipped', queueController.recallSkipped);
app.get('/api/doctors', queueController.getDoctors); // Helper to get doctors and their status

// Medical Record Routes
const medicalRecordController = require('./controllers/medicalRecordController');
app.post('/api/medical-records', authMiddleware, medicalRecordController.create);
app.get('/api/medical-records/history', authMiddleware, medicalRecordController.getHistory);
app.get('/api/medical-records/patient/:patient_id', authMiddleware, medicalRecordController.getByPatient);

// Pharmacy Routes
const medicineController = require('./controllers/medicineController');
const prescriptionController = require('./controllers/prescriptionController');

app.get('/api/medicines', authMiddleware, medicineController.getAll);
app.post('/api/medicines', authMiddleware, medicineController.create);
app.put('/api/medicines/:id', authMiddleware, medicineController.update);
app.delete('/api/medicines/:id', authMiddleware, medicineController.delete);

app.post('/api/prescriptions', authMiddleware, prescriptionController.create);
app.get('/api/prescriptions', authMiddleware, prescriptionController.getAll);
app.put('/api/prescriptions/:id/status', authMiddleware, prescriptionController.updateStatus);

// Transaction & Billing Routes
const transactionController = require('./controllers/transactionController');
app.get('/api/transactions/unbilled', authMiddleware, transactionController.getPending); // Or unbilled
app.get('/api/transactions', authMiddleware, transactionController.getPending); // Using same pending logic for now
app.post('/api/transactions/invoice', authMiddleware, transactionController.createInvoice);
app.put('/api/transactions/:id/pay', authMiddleware, transactionController.pay);


// Master Data Routes
app.get('/api/polies', poliklinikController.getAll);
app.post('/api/polies', poliklinikController.create);
app.put('/api/polies/:id', poliklinikController.update);
app.delete('/api/polies/:id', poliklinikController.delete);

app.get('/api/doctors-master', doctorController.getAll); // Different endpoint to avoid conflict with queueController.getDoctors
app.post('/api/doctors', doctorController.create);
app.put('/api/doctors/:id', doctorController.update);
app.delete('/api/doctors/:id', doctorController.delete);

// Doctor Leave Routes
const doctorLeaveController = require('./controllers/doctorLeaveController');
app.get('/api/doctor-leaves', doctorLeaveController.getLeaves);
app.post('/api/doctor-leaves', doctorLeaveController.addLeave);
app.delete('/api/doctor-leaves/:id', doctorLeaveController.deleteLeave);

app.get('/api/counters', counterController.getAll);
app.post('/api/counters', counterController.create);
app.put('/api/counters/:id', counterController.update);
app.delete('/api/counters/:id', counterController.delete);

// Playlist Routes
const playlistController = require('./controllers/playlistController');
app.get('/api/playlist', playlistController.getAll);
app.post('/api/playlist', playlistController.create);
app.put('/api/playlist/:id', playlistController.update);
app.delete('/api/playlist/:id', playlistController.delete);

// Setting Routes
const settingController = require('./controllers/settingController');
app.get('/api/settings', settingController.getSettings);
app.put('/api/settings', settingController.updateSetting);

// Socket.io Connection
const activeCounters = new Map(); // socketId -> { name, poliId }

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_counter', async (data) => {
        const { counterName, poliId } = data;
        activeCounters.set(socket.id, { name: counterName, poliId });

        // Update DB status to OPEN
        try {
            await prisma.counter.update({
                where: { name: counterName },
                data: { status: 'OPEN' }
            });
        } catch (error) {
            console.error(`Failed to update status for ${counterName}:`, error);
        }

        // Broadcast active counters list
        const countersList = Array.from(activeCounters.values());
        const uniqueCounters = Array.from(new Map(countersList.map(item => [item.name, item])).values());

        io.emit('active_counters_update', uniqueCounters);
        console.log(`Counter joined: ${counterName}`);
    });

    socket.on('disconnect', async () => {
        if (activeCounters.has(socket.id)) {
            const { name } = activeCounters.get(socket.id);
            activeCounters.delete(socket.id);

            // Update DB status to CLOSED
            try {
                // Only set to CLOSED if no other active socket is using this counter name
                const isStillActive = Array.from(activeCounters.values()).some(c => c.name === name);
                if (!isStillActive) {
                    await prisma.counter.update({
                        where: { name: name },
                        data: { status: 'CLOSED' }
                    });
                }
            } catch (error) {
                console.error(`Failed to update status for ${name}:`, error);
            }

            const countersList = Array.from(activeCounters.values());
            const uniqueCounters = Array.from(new Map(countersList.map(item => [item.name, item])).values());

            io.emit('active_counters_update', uniqueCounters);
            console.log(`Counter disconnected: ${name}`);
        }
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;


const initScheduler = require('./services/scheduler');

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initScheduler(io);
});
