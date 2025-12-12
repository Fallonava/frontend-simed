const { PrismaClient } = require('@prisma/client');

exports.getLeaves = async (req, res) => {
    const { prisma } = req;
    const { doctor_id } = req.query;

    try {
        const where = {};
        if (doctor_id) {
            where.doctor_id = parseInt(doctor_id);
        }

        const leaves = await prisma.doctorLeave.findMany({
            where,
            include: { doctor: true },
            orderBy: { date: 'asc' }
        });
        res.json(leaves);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch leaves' });
    }
};

exports.addLeave = async (req, res) => {
    const { prisma } = req;
    const { doctor_id, date, reason } = req.body;

    try {
        const leaveDate = new Date(date);
        leaveDate.setHours(0, 0, 0, 0);

        const leave = await prisma.doctorLeave.create({
            data: {
                doctor_id: parseInt(doctor_id),
                date: leaveDate,
                reason
            }
        });
        res.json(leave);
    } catch (error) {
        console.error(error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Leave already exists for this date' });
        }
        res.status(500).json({ error: 'Failed to add leave' });
    }
};

exports.deleteLeave = async (req, res) => {
    const { prisma } = req;
    const { id } = req.params;

    try {
        await prisma.doctorLeave.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Leave deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete leave' });
    }
};
