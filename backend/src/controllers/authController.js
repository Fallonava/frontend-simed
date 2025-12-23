const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

exports.login = async (req, res) => {
    const { prisma } = req;
    console.log('Login Request Body:', req.body); // DEBUG
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.me = async (req, res) => {
    // User is already attached by middleware
    res.json(req.user);
};

exports.loginPatient = async (req, res) => {
    const { prisma } = req;
    const { nik } = req.body || {};

    if (!nik) {
        return res.status(400).json({ error: 'NIK is required' });
    }

    try {
        const patient = await prisma.patient.findUnique({
            where: { nik }
        });

        if (!patient) {
            return res.status(401).json({ error: 'NIK tidak ditemukan or Pasien belum terdaftar' });
        }

        // For MVP: No password, just NIK valid.
        // In future: Verify DOB or OTP.

        const token = jwt.sign(
            { id: patient.id, nik: patient.nik, name: patient.name, role: 'PATIENT' },
            JWT_SECRET,
            { expiresIn: '30d' } // Long session for mobile
        );

        res.json({
            token,
            user: {
                id: patient.id,
                nik: patient.nik,
                name: patient.name,
                role: 'PATIENT',
                no_rm: patient.no_rm
            }
        });
    } catch (error) {
        console.error("Login Patient Error:", error);
        res.status(500).json({ error: 'Login failed' });
    }
};
