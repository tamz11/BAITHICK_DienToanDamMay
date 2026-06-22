require('dotenv').config();
const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();

async function main(){
  try{
    const users = await prisma.user.findMany();
    console.log(users.map(u => ({ id: u.id, email: u.email, role: u.role, isActive: u.isActive })));
  }catch(e){
    console.error('DB error:', e.message);
  }finally{ await prisma.$disconnect(); }
}

main();
