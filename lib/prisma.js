import { PrismaClient } from '@/app/generated/prisma'

// Sử dụng globalThis để chốt chặn kết nối an toàn tuyệt đối trên Turbopack
const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? new PrismaClient()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma