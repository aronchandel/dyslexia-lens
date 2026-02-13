const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // check if user exists
        const userExists = await prisma.user.findUnique({
            where: { email },
        });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // check for user email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            // streak logic
            const now = new Date();
            const lastLogin = new Date(user.lastLoginDate);

            // normalize dates to midnight to compare days only
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const last = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());

            const diffTime = Math.abs(today - last);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let newStreak = user.streak;

            if (diffDays === 1) {
                // consecutive day
                newStreak += 1;
            } else if (diffDays > 1) {
                // missed a day (or more), reset streak
                newStreak = 1;
            }
            // if diffdays === 0 (same day), do nothing

            // update user stats
            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: {
                    lastLoginDate: now,
                    streak: newStreak
                }
            });

            res.json({
                _id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                streak: updatedUser.streak,
                token: generateToken(updatedUser.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
