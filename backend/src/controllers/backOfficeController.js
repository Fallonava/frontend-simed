const { PrismaClient } = require('@prisma/client');

// --- REMUNERATION & JASA MEDIS ---

/** 
 * Calculate and split fee from an invoice item. 
 * Logic: split into RS (Sarana) and Doctor (Pelayanan).
 */
exports.processInvoiceRemuneration = async (req, res) => {
    const { prisma } = req;
    const { invoice_id } = req.params;

    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: parseInt(invoice_id) },
            include: { items: true, patient: true }
        });

        if (!invoice) return res.status(404).json({ error: "Invoice not found" });

        for (const item of invoice.items) {
            // Mock Split Logic: 40% Sarana, 60% Pelayanan
            const sarana = item.amount * 0.4;
            const pelayanan = item.amount * 0.6;

            await prisma.invoiceItem.update({
                where: { id: item.id },
                data: {
                    jasa_sarana: sarana,
                    jasa_pelayanan: pelayanan
                }
            });

            // Log to Doctor FEE if a doctor_id is present
            if (item.doctor_id) {
                await prisma.doctorFeeLog.create({
                    data: {
                        doctor_id: item.doctor_id,
                        invoice_id: invoice.id,
                        patient_name: invoice.patient.name,
                        service_name: item.description,
                        amount: pelayanan,
                        status: 'PENDING'
                    }
                });
            }
        }

        res.json({ message: "Remuneration processed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to process remuneration" });
    }
};

// --- FIXED ASSETS & MAINTENANCE ---

exports.createAsset = async (req, res) => {
    const { prisma } = req;
    const { name, code, purchase_date, purchase_price, useful_life, status } = req.body;
    try {
        const asset = await prisma.fixedAsset.create({
            data: {
                name,
                code,
                purchase_date: new Date(purchase_date),
                purchase_price: parseFloat(purchase_price),
                useful_life: parseInt(useful_life),
                status
            }
        });
        res.status(201).json(asset);
    } catch (error) {
        res.status(500).json({ error: "Failed to create asset" });
    }
};

exports.getAssetDepreciation = async (req, res) => {
    const { prisma } = req;
    try {
        const assets = await prisma.fixedAsset.findMany();
        const reports = assets.map(asset => {
            const ageMonths = (new Date() - new Date(asset.purchase_date)) / (1000 * 60 * 60 * 24 * 30);
            const monthlyDep = asset.purchase_price / (asset.useful_life * 12);
            const totalDep = Math.min(asset.purchase_price, monthlyDep * ageMonths);
            const bookValue = asset.purchase_price - totalDep;

            return {
                ...asset,
                monthly_depreciation: monthlyDep,
                total_depreciation: totalDep,
                book_value: bookValue
            };
        });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: "Failed to calculate depreciation" });
    }
};

// --- ACCOUNTING & JOURNALING ---

exports.createJournal = async (req, res) => {
    const { prisma } = req;
    const { description, reference_no, entries } = req.body; // entries: [{account_code, account_name, debit, credit}]
    try {
        const journal = await prisma.accountingJournal.create({
            data: {
                description,
                reference_no,
                entries: {
                    create: entries
                }
            },
            include: { entries: true }
        });
        res.status(201).json(journal);
    } catch (error) {
        res.status(500).json({ error: "Failed to create journal entry" });
    }
};

// --- HR & CREDENTIALING ---

exports.checkCredentialAlock = async (req, res) => {
    const { prisma } = req;
    try {
        const now = new Date();
        const expiredEmployees = await prisma.employee.findMany({
            where: {
                sip_expiry: { lt: now },
                is_locked: false
            }
        });

        for (const emp of expiredEmployees) {
            await prisma.employee.update({
                where: { id: emp.id },
                data: {
                    is_locked: true,
                    lock_reason: `SIP/STR Expired on ${emp.sip_expiry.toLocaleDateString()}`
                }
            });
        }

        res.json({ message: `Locked ${expiredEmployees.length} employees with expired credentials.` });
    } catch (error) {
        res.status(500).json({ error: "Credential check failed" });
    }
};
