import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(req) {
  try {
    await requireAdmin(req)
    const stores = await prisma.store.findMany({ orderBy: { createdAt: 'desc' } })
    return new Response(JSON.stringify({ stores }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}

export async function PUT(req) {
  try {
    await requireAdmin(req)
    const { storeId, isActive, status } = await req.json()
    if (!storeId) return new Response(JSON.stringify({ error: 'Missing storeId' }), { status: 400 })

    const data = {}
    if (typeof isActive === 'boolean') data.isActive = isActive
    if (typeof status === 'string') data.status = status

    if (!Object.keys(data).length) return new Response(JSON.stringify({ error: 'Nothing to update' }), { status: 400 })

    const updated = await prisma.store.update({ where: { id: storeId }, data })
    return new Response(JSON.stringify({ store: updated }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}
