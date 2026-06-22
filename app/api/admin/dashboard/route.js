import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(req) {
  try {
    await requireAdmin(req)

    const [totalProducts, totalStores, pendingStores, totalUsers, orders] = await Promise.all([
      prisma.product.count(),
      prisma.store.count(),
      prisma.store.count({ where: { status: 'pending' } }),
      prisma.user.count(),
      prisma.order.findMany({ select: { total: true, createdAt: true } })
    ])

    const totalOrders = orders.length
    const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0)

    const byDay = {}
    orders.forEach((o) => {
      const d = o.createdAt.toISOString().slice(0, 10)
      byDay[d] = (byDay[d] || 0) + (o.total || 0)
    })

    const byDayArray = Object.keys(byDay).sort().map((k) => ({ date: k, revenue: byDay[k] }))

    return new Response(JSON.stringify({ totalProducts, totalStores, pendingStores, totalUsers, totalOrders, totalRevenue, byDay: byDayArray }))
  } catch (err) {
    console.error('Admin dashboard error:', err)
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}
