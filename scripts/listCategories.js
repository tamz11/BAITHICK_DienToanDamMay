require('dotenv').config();
const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();

async function main(){
  try{
    const categories = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
    const data = [];
    for(const c of categories){
      const products = await prisma.product.findMany({ where: { category: c.name }, include: { store: { select: { id: true, name: true, username: true } } }, take: 20 })
      data.push({ category: c, products });
    }
    console.log(JSON.stringify(data, null, 2));
  }catch(e){
    console.error('DB error:', e.message);
  }finally{
    await prisma.$disconnect();
  }
}

main();
