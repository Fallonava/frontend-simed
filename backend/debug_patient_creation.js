const { PrismaClient } = require('@prisma/client');
const rmService = require('./src/services/rmService');
const prisma = new PrismaClient();

async function testCreate() {
    console.log('--- Starting Patient Creation Test ---');

    // 1. Test RM Generation
    try {
        console.log('Testing RM Generation...');
        const rm = await rmService.generateNextRM();
        console.log('Generated RM:', rm);
    } catch (e) {
        console.error('RM Gen Failed:', e);
        return;
    }

    // 2. Test Patient Insert
    try {
        console.log('Testing Patient Insert...');
        const uniqueSuffix = Date.now().toString().slice(-4);
        const rm = await rmService.generateNextRM(); // Generate another for the insert

        const patientData = {
            nik: `1234567890${uniqueSuffix}`, // Ensure unique NIK
            no_rm: rm,
            name: "Test Patient",
            gender: "L",
            birth_date: new Date('1990-01-01'),
            address: "Test Address",
            phone: "08123456789",
            bpjs_no: `BPJS${uniqueSuffix}`
        };

        const patient = await prisma.patient.create({
            data: patientData
        });
        console.log('Patient Created Successfully:', patient);

    } catch (e) {
        console.error('Patient Insert Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

testCreate();
