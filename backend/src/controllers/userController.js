const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
    const { prisma } = req;
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                role: true,
                employee: {
                    select: {
                        full_name: true,
                        nip: true
                    }
                }
            },
            orderBy: { id: 'asc' }
        });
        res.json(users);
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

exports.createUser = async (req, res) => {
    const { prisma } = req;
    const { username, password, role, fullName, nip } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role,
                ...(fullName && {
                    employee: {
                        create: {
                            full_name: fullName,
                            nip: nip || `EMP-${Date.now()}`,
                            role: role // Sync Access Role with Employee Role field
                        }
                    }
                })
            }
        });

        res.status(201).json({ message: 'User created successfully', user: { id: newUser.id, username: newUser.username, role: newUser.role } });
    } catch (error) {
        console.error('Create User Error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

exports.updateUser = async (req, res) => {
    const { prisma } = req;
    const { id } = req.params;
    const { password, role } = req.body;

    try {
        const data = {};
        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }
        if (role) {
            data.role = role;
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data,
            select: { id: true, username: true, role: true }
        });

        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

exports.deleteUser = async (req, res) => {
    const { prisma } = req;
    const { id } = req.params;

    // Prevent deleting self
    if (parseInt(id) === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    try {
        await prisma.user.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
