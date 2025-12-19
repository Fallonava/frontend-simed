const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit'); // Security: Rate Limiting

// ... Controllers imports ...
const queueController = require('./controllers/queueController');
const poliklinikController = require('./controllers/poliklinikController');
const doctorController = require('./controllers/doctorController');
const counterController = require('./controllers/counterController');
const chronologyController = require('./controllers/chronologyController');
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

app.get('/api/time', (req, res) => {
    res.json({ time: new Date() });
});

const defaultOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "https://frontend-simed.vercel.app", "http://13.210.197.247", "https://app.fallonava.my.id"];
const envOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];

const checkOrigin = (origin, callback) => {
    // console.log('Check Origin:', origin); // DEBUG: Log only if needed
    if (!origin) return callback(null, true); // Allow non-browser agents (e.g. Postman, Server-to-Server)

    const allowed = [...defaultOrigins, ...envOrigins];
    if (allowed.includes(origin) || origin.startsWith('http://192.168.') || origin.startsWith('http://172.') || origin.startsWith('http://10.')) {
        callback(null, true);
    } else {
        console.warn(`[CORS BLOCK] Origin: ${origin} not allowed.`);
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

// Security: Rate Limiter for AI Generation (Prevent Abuse/Cost Spikes)
const chronologyLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per windowMs
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

app.post('/api/chronology/generate', authMiddleware, chronologyLimiter, upload.single('file'), chronologyController.generateChronology);
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

// ICD-10 Routes
const icd10Controller = require('./controllers/icd10Controller');
app.get('/api/icd10', authMiddleware, icd10Controller.search);


// Medical Record Routes
const medicalRecordController = require('./controllers/medicalRecordController');
app.post('/api/medical-records', authMiddleware, medicalRecordController.create);
app.get('/api/medical-records/history', authMiddleware, medicalRecordController.getHistory); // By patient_id query
app.get('/api/medical-records/all', authMiddleware, medicalRecordController.getAll); // Dashboard listing
app.get('/api/medical-records/patient/:patient_id', authMiddleware, medicalRecordController.getByPatient);

// Service Order Routes (CPOE: Lab/Rad)
const serviceOrderController = require('./controllers/serviceOrderController');
app.post('/api/service-orders', authMiddleware, serviceOrderController.create);
app.get('/api/service-orders', authMiddleware, serviceOrderController.getAll);
app.put('/api/service-orders/:id/status', authMiddleware, serviceOrderController.updateStatus);

// Triage Routes (Nurse Station)
const triageController = require('./controllers/triageController');
app.get('/api/triage/queue', authMiddleware, triageController.getTriageQueue);
app.post('/api/triage/:queueId/submit', authMiddleware, triageController.submitTriage);

// BPJS Routes (Bridging/Mock)
const bpjsController = require('./controllers/bpjsController');
app.post('/api/bpjs/check-participant', authMiddleware, bpjsController.checkParticipant);
app.post('/api/bpjs/sep/insert', authMiddleware, bpjsController.createSEP);

// BPJS Antrean Online (Mock endpoints for Mobile JKN)
const antreanController = require('./controllers/antreanController');
app.get('/api/antrean/status/:kodepoli/:tanggal', antreanController.getStatusAntrean);
app.get('/api/antrean/sisa', antreanController.getSisaAntrean);
app.post('/api/antrean/ambil', antreanController.ambilAntrean);

// Inpatient / Admission Routes
const admissionController = require('./controllers/admissionController');
app.get('/api/admission/rooms', authMiddleware, admissionController.getRooms);
app.post('/api/admission/checkin', authMiddleware, admissionController.checkIn);
app.post('/api/admission/checkout', authMiddleware, admissionController.checkOut);
app.put('/api/admission/bed-status', authMiddleware, admissionController.updateBedStatus);

// Inpatient Clinical Routes (CPPT & e-MAR)
const inpatientController = require('./controllers/inpatientController');
app.get('/api/inpatient/:admissionId/clinical', authMiddleware, inpatientController.getClinicalData);
app.post('/api/inpatient/:admissionId/observation', authMiddleware, inpatientController.addObservation);
app.post('/api/inpatient/:admissionId/mar', authMiddleware, inpatientController.logMedication);

// Nutrition / Gizi Routes
const nutritionController = require('./controllers/nutritionController');
app.get('/api/nutrition/menus', authMiddleware, nutritionController.getMenus);
app.post('/api/nutrition/order', authMiddleware, nutritionController.createOrder);
app.get('/api/nutrition/kitchen', authMiddleware, nutritionController.getKitchenOrders);
app.put('/api/nutrition/order/:id/status', authMiddleware, nutritionController.updateStatus);

// HR Routes
const hrController = require('./controllers/hrController');
app.get('/api/hr/employees', authMiddleware, hrController.getEmployees);
app.put('/api/hr/employee/:id', authMiddleware, hrController.updateEmployee);
app.get('/api/hr/roster', authMiddleware, hrController.getRoster);
app.post('/api/hr/schedule', authMiddleware, hrController.assignShift);
app.post('/api/hr/auto-roster', authMiddleware, hrController.autoGenerateRoster); // NEW
app.get('/api/hr/payroll', authMiddleware, hrController.getPayrollStats);        // NEW

// Finance Routes
const financeController = require('./controllers/financeController');
app.post('/api/finance/generate', authMiddleware, financeController.createInvoice);
app.get('/api/finance/unpaid', authMiddleware, financeController.getUnpaidInvoices);
app.post('/api/finance/pay/:id', authMiddleware, financeController.payInvoice);
app.get('/api/finance/billables', authMiddleware, financeController.getBillableVisits);
app.get('/api/finance/report', authMiddleware, financeController.getDailyReport);
app.get('/api/finance/analytics', authMiddleware, financeController.getAnalytics); // NEW

// Bed Head Unit Routes (Tablet)
app.get('/api/bed-panel/:bedId', admissionController.getBedPanel); // Public/Kiosk for demo

// SATUSEHAT Integration
app.get('/api/satusehat/patient', authMiddleware, require('./controllers/satusehatController').searchPatientByNIK);
app.post('/api/satusehat/encounter', authMiddleware, require('./controllers/satusehatController').createEncounter);

// Smart Documents
const documentController = require('./controllers/documentController');
app.post('/api/documents/generate', authMiddleware, documentController.generateDocument);
app.post('/api/bed-panel/request', admissionController.requestService);

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
app.get('/api/transactions/unbilled', authMiddleware, transactionController.getUnbilled);
app.get('/api/transactions', authMiddleware, transactionController.getPending); // Using same pending logic for now
app.post('/api/transactions/invoice', authMiddleware, transactionController.createInvoice);
app.put('/api/transactions/:id/pay', authMiddleware, transactionController.pay);

// Billing Routes
// ...

// Inventory & Logistics Routes (Phase 2)
const inventoryController = require('./controllers/inventoryController');
app.get('/api/inventory/stocks', authMiddleware, inventoryController.getStock);
app.get('/api/inventory/alerts', authMiddleware, inventoryController.getLowStock);
app.post('/api/inventory/po', authMiddleware, inventoryController.createPO);
app.get('/api/inventory/po/pending', authMiddleware, inventoryController.getPendingPOs);
app.post('/api/inventory/receive', authMiddleware, inventoryController.receiveGoods);
app.post('/api/inventory/transfer', authMiddleware, inventoryController.transferStock);
app.post('/api/inventory/transfer', authMiddleware, inventoryController.transferStock);

// Back Office: Casemix & Claims (Phase 2b)
const casemixController = require('./controllers/casemixController');
app.get('/api/casemix/pending', authMiddleware, casemixController.getPendingCoding);
app.post('/api/casemix/save', authMiddleware, casemixController.saveCoding);
app.post('/api/casemix/claim', authMiddleware, casemixController.generateClaimFile);

// Bed Management (Phase 2b)
const bedController = require('./controllers/bedController');
app.get('/api/beds', authMiddleware, bedController.getAllBeds);
app.get('/api/beds/stats', authMiddleware, bedController.getStats);
app.put('/api/beds/:id/status', authMiddleware, bedController.updateBedStatus);

// Nurse Station (CPPT & e-MAR) (Phase 2b)
// Nurse Station (CPPT & e-MAR) (Phase 2b)
// inpatientController already required above
app.get('/api/nurse/active-inpatients', authMiddleware, admissionController.getActive);
app.get('/api/inpatient/:admissionId/clinical', authMiddleware, inpatientController.getClinicalData);
app.post('/api/inpatient/:admissionId/observation', authMiddleware, inpatientController.addObservation);
app.post('/api/inpatient/:admissionId/mar', authMiddleware, inpatientController.logMedication);

const dischargeController = require('./controllers/dischargeController');
app.post('/api/discharge/:id/finalize', authMiddleware, dischargeController.finalizeDischarge);

// LIS/RIS Bridging (Phase 2b)
const integratedResultController = require('./controllers/integratedResultController');
app.get('/api/results/pending', authMiddleware, integratedResultController.getPendingOrders);
app.put('/api/results/:id/submit', authMiddleware, integratedResultController.submitResult);

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
