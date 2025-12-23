const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PDFDocument = require('pdfkit');

exports.generateDocument = async (req, res) => {
    const { type, patient_id, data } = req.body;

    try {
        const patient = await prisma.patient.findUnique({ where: { id: parseInt(patient_id) } });
        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        // Create PDF Stream
        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${type}_${patient.no_rm}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('RUMAH SAKIT UMUM SIMED', { align: 'center' });
        doc.fontSize(10).text('Jl. Raya Kesehatan No. 123, Jakarta', { align: 'center' });
        doc.moveDown();
        doc.moveTo(50, 100).lineTo(550, 100).stroke();
        doc.moveDown(2);

        // Title
        let title = 'SURAT KETERANGAN';
        if (type === 'SICK_LEAVE') title = 'SURAT KETERANGAN SAKIT';
        if (type === 'HEALTH_CERT') title = 'SURAT KETERANGAN SEHAT';
        if (type === 'REFERRAL') title = 'SURAT RUJUKAN';

        doc.fontSize(14).font('Helvetica-Bold').text(title, { align: 'center', underline: true });
        doc.moveDown();

        // Content
        doc.fontSize(12).font('Helvetica').text(`Yang bertanda tangan di bawah ini menerangkan bahwa:`);
        doc.moveDown();

        doc.text(`Nama         : ${patient.name}`);
        doc.text(`No. RM      : ${patient.no_rm}`);
        doc.text(`Tgl Lahir    : ${new Date(patient.birth_date).toLocaleDateString()}`);
        doc.text(`Alamat       : ${patient.address || '-'}`);
        doc.moveDown();

        if (type === 'SICK_LEAVE') {
            doc.text(`Perlu beristirahat selama ${data.days || 1} hari karena sakit.`);
            doc.text(`Terhitung mulai tanggal ${data.startDate || new Date().toLocaleDateString()}.`);
            doc.text(`Diagnosa: ${data.diagnosis || '-'}`);
        } else if (type === 'HEALTH_CERT') {
            doc.text(`Telah diperiksa kesehatannya dengan hasil:`);
            doc.text(`Tinggi Badan : ${data.height} cm`);
            doc.text(`Berat Badan  : ${data.weight} kg`);
            doc.text(`Gol. Darah   : ${data.bloodType}`);
            doc.text(`Buta Warna   : ${data.colorBlind === 'true' ? 'Ya' : 'Tidak'}`);
            doc.moveDown();
            doc.text(`Surat ini dibuat untuk keperluan: ${data.purpose || '-'}`);
        } else if (type === 'REFERRAL') {
            doc.text(`Dirujuk ke RS : ${data.targetHospital}`);
            doc.text(`Poli Tujuan   : ${data.targetPoli}`);
            doc.text(`Alasan        : ${data.reason}`);
        }

        doc.moveDown(2);
        doc.text(`Jakarta, ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.moveDown();
        doc.text('( Dr. Pemeriksa )', { align: 'right' });

        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate document' });
    }
};
