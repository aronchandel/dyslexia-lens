const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.updateProgress = async (req, res) => {
    try {
        console.log('Update progress request received:', req.body);
        const userId = req.user.id;
        const { xpGain } = req.body; // expecting { xpgain: 50 }

        // 1. Get current user stats
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Calculate new stats
        let newXp = user.xp + xpGain;
        let newLevel = user.level;

        // simple level up logic: level up every 500 xp
        if (newXp >= newLevel * 500) {
            newLevel += 1;
        }

        // 3. Update User
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                xp: newXp,
                level: newLevel,
                // for now, we interact, so streak checking logic could be more complex (e.g., check last activity date)
                // here we just ensure streak is at least 1 if they are active
                streak: user.streak === 0 ? 1 : user.streak
            }
        });

        res.json({
            message: 'Progress updated',
            stats: {
                xp: updatedUser.xp,
                level: updatedUser.level,
                streak: updatedUser.streak
            }
        });

    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ message: 'Error updating progress' });
    }
};

exports.updateTime = async (req, res) => {
    try {
        const userId = req.user.id;
        const { seconds } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        let newTime = user.totalTimeSeconds + seconds;
        let newXp = user.xp + Math.floor(seconds / 10); // 1 XP per 10 seconds
        let newLevel = user.level;

        // level up check
        if (newXp >= newLevel * 500) {
            newLevel += 1;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                totalTimeSeconds: newTime,
                xp: newXp,
                level: newLevel
            }
        });

        res.json({
            message: 'Time updated',
            stats: {
                totalTimeSeconds: updatedUser.totalTimeSeconds,
                xp: updatedUser.xp,
                level: updatedUser.level
            }
        });
    } catch (error) {
        console.error('Error updating time:', error);
        res.status(500).json({ message: 'Error updating time' });
    }
};

exports.getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                xp: true,
                level: true,
                streak: true,
                totalWordsRead: true,
                totalTimeSeconds: true
            }
        });
        res.json(user);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

exports.getMe = async (req, res) => {
    try {
        // req.user is already set by authMiddleware
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        res.json(user);
    } catch (error) {
        console.error('Error fetching me:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
};
