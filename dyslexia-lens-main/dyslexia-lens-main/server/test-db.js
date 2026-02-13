const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Attempting to connect to database...');
    try {
        await prisma.$connect();
        console.log('Connection successful!');
    } catch (e) {
        console.error('Connection failed:', e.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
