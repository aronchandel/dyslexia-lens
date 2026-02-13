const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Deleting all documents...');
        await prisma.document.deleteMany({});
        console.log('Deleted all documents.');

        console.log('Deleting all users...');
        await prisma.user.deleteMany({});
        console.log('Deleted all users.');

        console.log('Database cleared successfully.');
    } catch (error) {
        console.error('Error clearing database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
