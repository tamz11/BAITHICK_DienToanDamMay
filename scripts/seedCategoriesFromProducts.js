require('dotenv').config();
const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();

async function main(){
  try{
    const products = await prisma.product.findMany({ select: { category: true } });
    const set = new Set(products.map(p=>p.category).filter(Boolean));
    const categories = [];
    for(const name of set){
      // skip if exists
      const exists = await prisma.category.findUnique({ where: { name } }).catch(()=>null);
      if (!exists) {
        const created = await prisma.category.create({ data: { name } });
        categories.push(created);
      }
    }
    console.log('Created categories:', categories);
  }catch(e){
    console.error('DB error:', e.message);
  }finally{ await prisma.$disconnect(); }
}

main();
