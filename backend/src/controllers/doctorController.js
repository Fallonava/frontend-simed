const { PrismaClient } = require('@prisma/client');

exports.getAll = async (req, res) => {
    const { prisma } = req;
    try {
        const doctors = await prisma.doctor.findMany({
            include: {
                poliklinik: true,
                schedules: true
            }
        });
        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
};

exports.create = async (req, res) => {
    const { prisma } = req;
    const { name, specialist, poliklinik_id, photo_url, schedules } = req.body;
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
                photo_url,
                schedules: {
                    create: schedules // Expecting array of { day: Int, time: String }
                }
            },
            include: { schedules: true }
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
    const { name, specialist, poliklinik_id, photo_url, schedules } = req.body;
    try {
        // Transaction to update doctor and replace schedules
        const doctor = await prisma.$transaction(async (prisma) => {
            const updatedDoctor = await prisma.doctor.update({
                where: { id: parseInt(id) },
                data: {
                    name,
                    specialist,
                    poliklinik_id: parseInt(poliklinik_id),
                    photo_url
                }
            });

            if (schedules) {
                // Delete existing schedules
                await prisma.doctorSchedule.deleteMany({
                    where: { doctor_id: parseInt(id) }
                });

                // Create new schedules
                if (schedules.length > 0) {
                    await prisma.doctorSchedule.createMany({
                        data: schedules.map(s => ({
                            doctor_id: parseInt(id),
                            day: parseInt(s.day),
                            time: s.time
                        }))
                    });
                }
            }

            return prisma.doctor.findUnique({
                where: { id: parseInt(id) },
                include: { schedules: true, poliklinik: true }
            });
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
