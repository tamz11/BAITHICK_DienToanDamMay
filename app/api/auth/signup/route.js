import prisma from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'

export async function POST(req) {
  try {
    const { name, email, password } = await req.json()
    if (!email || !password) return new Response(JSON.stringify({ error: 'Missing' }), { status: 400 })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return new Response(JSON.stringify({ error: 'User exists' }), { status: 409 })

    const hashed = await hashPassword(password)
    const user = await prisma.user.create({ data: { name, email, password: hashed } })
    const token = signToken(user)
    return new Response(JSON.stringify({ user: { id: user.id, email: user.email, role: user.role }, token }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
