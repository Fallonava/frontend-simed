const bcrypt = require('bcryptjs');

exports.getAll = async (req, res) => {
    const { prisma } = req;
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                role: true
            }
        });
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

exports.create = async (req, res) => {
    const { prisma } = req;
    const { username, password, role } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { username }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: role || 'STAFF'
            },
            select: {
                id: true,
                username: true,
                role: true
            }
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

exports.update = async (req, res) => {
    const { prisma } = req;
    const { id } = req.params;
    const { password, role } = req.body;

    try {
        const dataToUpdate = {};
        if (role) dataToUpdate.role = role;
        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: dataToUpdate,
            select: {
                id: true,
                username: true,
                role: true
            }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

exports.delete = async (req, res) => {
    const { prisma } = req;
    const { id } = req.params;

    // Prevent deleting self? Ideally yes, but skipping complex logic for now.
    // At least prevent deleting the last admin if possible, but keep it simple.

    try {
        await prisma.user.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
