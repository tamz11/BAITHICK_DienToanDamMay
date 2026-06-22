require('dotenv').config();
const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  try {
    const stores = await prisma.store.findMany({ where: { status: 'pending' }, include: { user: true } });
    console.log(JSON.stringify(stores, null, 2));
  } catch (e) {
    console.error('DB error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
