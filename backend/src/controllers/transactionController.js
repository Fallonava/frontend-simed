const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Pending Bills (Unpaid)
exports.getPending = async (req, res) => {
    try {
        // Find Medical Records that are completed (have diagnosis) but NOT yet paid (no transaction or status UNPAID)
        // Logic: Get all MedicalRecords, check if Transaction exists
        const records = await prisma.medicalRecord.findMany({
            where: {
                assessment: { not: '' }, // Completed
                prescriptions: { some: { status: 'COMPLETED' } } // Only if prescriptions are ready? Optional logic
            },
            include: {
                patient: true,
                doctor: true,
                prescriptions: { include: { items: { include: { medicine: true } } } },
                // transaction: true // Relation not explicitly defined in MedicalRecord yet, checking manually
            },
            orderBy: { created_at: 'asc' }
        });

        // Filter out already PAID
        // Since we don't have direct relation in `records` query easily without side-loading, 
        // we'll fetch transactions first or refine schema. 
        // Better approach: Query Transactions with status 'UNPAID' OR Create one if not exists.

        // For now: Fetch UNPAID Transactions. If not created yet, frontend triggers 'Create Bill' or we auto-create.
        // Let's implement: "Billable Items" endpoint.

        // Revised Logic: Return all Medical Records from today/recent that don't have a PAID transaction.
        const transactions = await prisma.transaction.findMany({
            where: { status: 'UNPAID' },
            include: {
                patient: true,
                medical_record: { include: { doctor: true, prescriptions: { include: { items: { include: { medicine: true } } } } } },
                items: true
            }
        });

        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch pending bills' });
    }
};

// Generate Invoice (Create Transaction)
exports.createInvoice = async (req, res) => {
    const { medical_record_id } = req.body;

    try {
        const record = await prisma.medicalRecord.findUnique({
            where: { id: parseInt(medical_record_id) },
            include: {
                doctor: true,
                patient: true,
                prescriptions: { include: { items: { include: { medicine: true } } } },
                service_orders: true // Include Lab/Rad orders
            }
        });

        if (!record) return res.status(404).json({ error: 'Record not found' });

        // Calculate Bill
        let total = 0;
        const items = [];

        // 1. Registration Fee (Fixed)
        const regFee = 15000;
        total += regFee;
        items.push({ description: 'Biaya Pendaftaran / Admin', amount: regFee, quantity: 1 });

        // 2. Doctor Fee (Mock: Specialist 50k, GP 30k)
        const docFee = record.doctor.specialist === 'Umum' ? 30000 : 50000;
        total += docFee;
        items.push({ description: `Jasa Dokter (${record.doctor.name})`, amount: docFee, quantity: 1 });

        // 3. Medicines
        if (record.prescriptions && record.prescriptions.length > 0) {
            record.prescriptions.forEach(p => {
                p.items.forEach(item => {
                    const cost = item.medicine.price * item.quantity;
                    total += cost;
                    items.push({
                        description: `Obat: ${item.medicine.name}`,
                        amount: item.medicine.price,
                        quantity: item.quantity
                    });
                });
            });
        }

        // 4. Lab & Radiology (Service Orders)
        if (record.service_orders && record.service_orders.length > 0) {
            record.service_orders.forEach(order => {
                // Only charge if completed (or charge regardless? standard is usually upon order or result. Let's say Completed)
                if (order.status === 'COMPLETED' || order.status === 'PENDING') {
                    // Note: Ideally we charge when ordered to prevent loss if patient leaves, 
                    // but for "Integrasi check" let's charge all associated orders.

                    let serviceCost = 0;
                    let desc = '';

                    if (order.type === 'LAB') {
                        serviceCost = 150000; // Mock Lab Price
                        desc = `Laboratorium: ${order.notes || 'General Checkup'}`;
                    } else if (order.type === 'RAD') {
                        serviceCost = 200000; // Mock Rad Price
                        desc = `Radiologi: ${order.notes || 'Imaging'}`;
                    }

                    if (serviceCost > 0) {
                        total += serviceCost;
                        items.push({
                            description: desc,
                            amount: serviceCost,
                            quantity: 1
                        });
                    }
                }
            });
        }

        // Check if invoice already exists?
        // For now, simpler to just create new (Multiple invoices possible per visit? Usually merged).
        // Let's assume one invoice per generate call.

        // Create Transaction
        const invoiceNo = `INV/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${Math.floor(Math.random() * 1000)}`;

        const transaction = await prisma.transaction.create({
            data: {
                invoice_no: invoiceNo,
                medical_record_id: record.id,
                patient_id: record.patient_id,
                total_amount: total,
                status: 'UNPAID',
                items: {
                    create: items
                }
            },
            include: { items: true }
        });

        res.json(transaction);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate invoice' });
    }
};

// Process Payment
exports.pay = async (req, res) => {
    const { id } = req.params;
    const { payment_method } = req.body; // CASH, QRIS

    try {
        const transaction = await prisma.transaction.update({
            where: { id: parseInt(id) },
            data: {
                status: 'PAID',
                payment_method
            }
        });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Payment failed' });
    }
};


// Helper: Check Billable Records (Records without Invoice)
// This is useful for the "Unbilled" list
exports.getUnbilled = async (req, res) => {
    try {
        const records = await prisma.medicalRecord.findMany({
            where: {
                assessment: { not: '' }, // Completed visit
                transaction: { is: null } // No transaction yet (Requires relation 'transaction' in schema.prisma for easier query, or we check manually)
                // Since One-to-One relation logic is cleaner:
                // medical_record has 'transactions Transaction[]' (no, it has one) or we use inverse relation? 
                // In schema we added: medical_record_id @unique in Transaction.
                // So MedicalRecord has 'Transaction?' relation. 
                // Let's ensure schema has this inverse field.
            },
            include: {
                patient: true,
                doctor: true
            },
            orderBy: { created_at: 'desc' }
        });

        // Filter those who truly don't have transaction (if schema relation is correct)
        // If 'transaction' relation isn't explicitly named 'transaction' in MedicalRecord, Prisma might name it 'Transaction'.
        // We will assume I added relation properly or will fix it now.

        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching unbilled' });
    }
};
