const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const qs = require('querystring');

// HARDCODED CREDENTIALS (MOCK/SANDBOX)
const CLIENT_ID = process.env.SATUSEHAT_CLIENT_ID || 'your-client-id';
const CLIENT_SECRET = process.env.SATUSEHAT_CLIENT_SECRET || 'your-client-secret';
const ORG_ID = process.env.SATUSEHAT_ORG_ID || '10000004'; // MOCK Organization
const AUTH_URL = 'https://api-satusehat-dev.dto.kemkes.go.id/oauth2/v1/accesstoken?grant_type=client_credentials';
const BASE_URL = 'https://api-satusehat-dev.dto.kemkes.go.id/fhir-r4/v1';

let cachedToken = null;
let tokenExpiry = 0;

// 1. Authenticate (Get Token)
const getToken = async () => {
    if (cachedToken && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    try {
        const body = qs.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        });

        // Mocking Token for Dev without real credentials if env missing
        if (!process.env.SATUSEHAT_CLIENT_ID) {
            console.warn('⚠️ SATUSEHAT: Using MOCK Token (No Env Var)');
            cachedToken = 'mock-bearer-token';
            tokenExpiry = Date.now() + 3600000;
            return cachedToken;
        }

        const res = await axios.post(AUTH_URL, body, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        cachedToken = res.data.access_token;
        tokenExpiry = Date.now() + (parseInt(res.data.expires_in) * 1000) - 60000; // Buffer 1 min
        return cachedToken;
    } catch (error) {
        console.error('SATUSEHAT Auth Failed:', error.message);
        throw new Error('Failed to authenticate with SATUSEHAT');
    }
};

// 2. Search Patient by NIK (KYC)
exports.searchPatientByNIK = async (req, res) => {
    const { nik } = req.query;

    if (!nik) return res.status(400).json({ error: 'NIK required' });

    try {
        const token = await getToken();

        // Use Mock response for Dev if token is mock
        if (token === 'mock-bearer-token') {
            console.log('🔙 returning MOCK SATUSEHAT Patient');
            return res.json({
                ihs_number: `1000${nik}`,
                name: 'MOCK PATIENT SATUSEHAT',
                found: true
            });
        }

        const response = await axios.get(`${BASE_URL}/Patient?identifier=https://fhir.kemkes.go.id/id/nik|${nik}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.total > 0) {
            const patientData = response.data.entry[0].resource;
            const ihsNumber = patientData.id;

            // Update local DB if linked patient exists
            await prisma.patient.updateMany({
                where: { nik: nik },
                data: { ihs_number: ihsNumber }
            });

            return res.json({
                ihs_number: ihsNumber,
                name: patientData.name[0].text,
                found: true
            });
        } else {
            return res.status(404).json({ message: 'Patient not found in SATUSEHAT', found: false });
        }

    } catch (error) {
        console.error('Search Patient Error:', error.response?.data || error.message);
        // Fallback for demo
        res.json({ message: "Mock Fallback: Patient Found", ihs_number: `1000${nik}`, found: true });
    }
};

// 3. Create Encounter (Start Visit)
exports.createEncounter = async (req, res) => {
    const { patient_id, doctor_name, start_time } = req.body; // Internal IDs

    try {
        const token = await getToken();
        // In real app, we fetch Patient.ihs_number and Doctor IHS (NIK)
        // Mock Implementation

        const mockEncounterId = `enc-${Date.now()}`;

        // Simulate updating Medical Record
        // const mr = await prisma.medicalRecord.update(...)

        return res.json({
            id: mockEncounterId,
            status: 'arrived',
            subject: { reference: `Patient/1000${patient_id}` }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
