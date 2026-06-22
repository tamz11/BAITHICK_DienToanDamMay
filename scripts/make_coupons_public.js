const { PrismaClient } = require('../app/generated/prisma');
(async () => {
  const prisma = new PrismaClient();
  try {
    const updated = await prisma.coupon.updateMany({ where: { isPublic: false }, data: { isPublic: true } });
    console.log('Updated coupons:', updated);
  } catch (e) {
    console.error('Error updating coupons:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
