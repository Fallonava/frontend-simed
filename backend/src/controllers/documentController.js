const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.generateDocument = async (req, res) => {
    const { type, medical_record_id, data } = req.body;
    // type: SAKIT, SEHAT, RUJUKAN

    try {
        const record = await prisma.medicalRecord.findUnique({
            where: { id: parseInt(medical_record_id) },
            include: {
                patient: true,
                doctor: { include: { poliklinik: true } },
                icd10: true
            }
        });

        if (!record) return res.status(404).json({ error: 'Record not found' });

        const doc = new PDFDocument({ margin: 50 });
        const fileName = `${type}_${record.patient.no_rm}_${Date.now()}.pdf`;
        // In real app, save to S3 or public folder. For now, stream to response.

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        doc.pipe(res);

        // Header (Kop Surat Mock)
        doc.fontSize(20).text('RS FALLONAVA', { align: 'center' });
        doc.fontSize(10).text('Jl. Kesehatan Modern No. 1, Jakarta', { align: 'center' });
        doc.moveDown();
        doc.lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();
        doc.moveDown();

        // Title
        let title = 'SURAT KETERANGAN';
        if (type === 'SAKIT') title = 'SURAT KETERANGAN SAKIT';
        if (type === 'SEHAT') title = 'SURAT KETERANGAN SEHAT';
        if (type === 'RUJUKAN') title = 'SURAT RUJUKAN';

        doc.fontSize(14).font('Helvetica-Bold').text(title, { align: 'center', underline: true });
        doc.moveDown(2);

        // Body
        doc.fontSize(12).font('Helvetica').text('Yang bertanda tangan di bawah ini menerangkan bahwa:', { align: 'left' });
        doc.moveDown(0.5);

        const labelX = 70;
        const valueX = 200;
        const yStart = doc.y;

        doc.text('Nama', labelX, yStart);
        doc.text(`: ${record.patient.name}`, valueX, yStart);
        doc.text('No RM', labelX, yStart + 20);
        doc.text(`: ${record.patient.no_rm}`, valueX, yStart + 20);
        doc.text('Tanggal Lahir', labelX, yStart + 40);
        doc.text(`: ${moment(record.patient.birth_date).format('DD-MM-YYYY')}`, valueX, yStart + 40);

        doc.moveDown(4);

        // Specific Content
        if (type === 'SAKIT') {
            doc.text(`Sedang dalam keadaan sakit dan membutuhkan istirahat selama ${data.rest_days || 1} (satu) hari.`);
            doc.text(`Diagnosa: ${record.icd10?.name || '-'}`);
        } else if (type === 'SEHAT') {
            doc.text('Telah diperiksa dan dinyatakan SEHAT.');
            doc.text(`Tinggi Badan: ${record.height || '-'} cm, Berat Badan: ${record.weight || '-'} kg.`);
            doc.text(`Tekanan Darah: ${record.systolic}/${record.diastolic} mmHg.`);
        } else if (type === 'RUJUKAN') {
            doc.text(`Dirujuk ke: ${data.destination || 'RS Lain'}`);
            doc.text(`Alasan: ${data.reason || '-'}`);
            doc.text(`Diagnosa Sementara: ${record.subjective}`);
        }

        doc.moveDown(2);
        doc.text(`Jakarta, ${moment().format('DD MMMM YYYY')}`, { align: 'right' });
        doc.moveDown();
        doc.text('Dokter Pemeriksa,', { align: 'right' });
        doc.moveDown(3);
        doc.text(`( ${record.doctor.name} )`, { align: 'right' });

        // Footer / QR Mock
        doc.moveDown(2);
        doc.fontSize(8).text(`Generated automatically by Fallonava SIMRS on ${moment().format('LLL')}`, { align: 'center', color: 'grey' });

        doc.end();

        // Save metadata asynchronously
        await prisma.medicalDocument.create({
            data: {
                type: type,
                medical_record_id: record.id,
                generated_url: fileName
            }
        });

    } catch (error) {
        if (!res.headersSent) res.status(500).json({ error: error.message });
        console.error(error);
    }
};

exports.getHistory = async (req, res) => {
    // Return list of docs for patient
    const { patient_id } = req.query;
    // Implementation skipped for MVP
    res.json([]);
};
