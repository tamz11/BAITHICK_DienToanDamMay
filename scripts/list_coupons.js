const { PrismaClient } = require('../app/generated/prisma');
(async () => {
  const prisma = new PrismaClient();
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    console.log(JSON.stringify(coupons, null, 2));
  } catch (e) {
    console.error('Error listing coupons:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
