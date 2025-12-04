const { PrismaClient } = require('@prisma/client');

exports.getAll = async (req, res) => {
    const { prisma } = req;
    try {
        const doctors = await prisma.doctor.findMany({
            include: { poliklinik: true }
        });
        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
};

exports.create = async (req, res) => {
    const { prisma } = req;
    const { name, specialist, poliklinik_id, photo_url } = req.body;
    try {
        // Validation: Ensure poliklinik exists
        const poli = await prisma.poliklinik.findUnique({
            where: { id: parseInt(poliklinik_id) }
        });

        if (!poli) {
            return res.status(400).json({ error: 'Invalid poliklinik_id' });
        }

        const doctor = await prisma.doctor.create({
            data: {
                name,
                specialist,
                poliklinik_id: parseInt(poliklinik_id),
                photo_url
            }
        });
        res.json(doctor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create doctor' });
    }
};

exports.update = async (req, res) => {
    const { prisma } = req;
    const { id } = req.params;
    const { name, specialist, poliklinik_id, photo_url } = req.body;
    try {
        const doctor = await prisma.doctor.update({
            where: { id: parseInt(id) },
            data: {
                name,
                specialist,
                poliklinik_id: parseInt(poliklinik_id),
                photo_url
            }
        });
        res.json(doctor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update doctor' });
    }
};

exports.delete = async (req, res) => {
    const { prisma } = req;
    const { id } = req.params;
    try {
        await prisma.doctor.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Doctor deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete doctor' });
    }
};
