import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

function getTokenFromHeader(req) {
  const auth = req.headers.get('authorization') || ''
  if (!auth) return null
  const [, token] = auth.split(' ')
  return token
}

export async function GET(req) {
  try {
    const token = getTokenFromHeader(req)
    const data = verifyToken(token)
    if (!data || data.role !== 'ADMIN') return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 })

    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } })
    return new Response(JSON.stringify({ users }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const token = getTokenFromHeader(req)
    const data = verifyToken(token)
    if (!data || data.role !== 'ADMIN') return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 })

    const { userId, role } = await req.json()
    if (!userId || !role) return new Response(JSON.stringify({ error: 'Missing' }), { status: 400 })

    const updated = await prisma.user.update({ where: { id: userId }, data: { role } })
    return new Response(JSON.stringify({ user: { id: updated.id, role: updated.role } }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
