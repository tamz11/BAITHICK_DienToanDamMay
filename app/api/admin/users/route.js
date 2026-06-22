import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(req) {
  try {
    await requireAdmin(req)
    const url = new URL(req.url)
    const q = url.searchParams.get('q')

    const where = q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } }
      ]
    } : {}

    const users = await prisma.user.findMany({ where, select: { id: true, name: true, email: true, role: true, isActive: true } })
    return new Response(JSON.stringify({ users }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}

export async function PUT(req) {
  try {
    await requireAdmin(req)

    const body = await req.json()
    const { userId, role, isActive } = body

    if (!userId) return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 })

    const data = {}
    if (role) data.role = role
    if (typeof isActive === 'boolean') data.isActive = isActive

    if (!Object.keys(data).length) return new Response(JSON.stringify({ error: 'Nothing to update' }), { status: 400 })

    const updated = await prisma.user.update({ where: { id: userId }, data })
    return new Response(JSON.stringify({ user: { id: updated.id, role: updated.role, isActive: updated.isActive } }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}

export async function DELETE(req) {
  try {
    await requireAdmin(req)

    const { userId } = await req.json()
    if (!userId) return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 })

    const target = await prisma.user.findUnique({ where: { id: userId } })
    if (!target) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })

    if (target.role === 'ADMIN') return new Response(JSON.stringify({ error: 'Cannot delete admin' }), { status: 403 })

    await prisma.user.delete({ where: { id: userId } })
    return new Response(JSON.stringify({ success: true }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}
