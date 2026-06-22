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
    const byMonth = {}
    const byYear = {}
    orders.forEach((o) => {
      const iso = o.createdAt.toISOString()
      const day = iso.slice(0, 10) // YYYY-MM-DD
      const month = iso.slice(0, 7) // YYYY-MM
      const year = iso.slice(0, 4) // YYYY

      byDay[day] = (byDay[day] || 0) + (o.total || 0)
      byMonth[month] = (byMonth[month] || 0) + (o.total || 0)
      byYear[year] = (byYear[year] || 0) + (o.total || 0)
    })

    const byDayArray = Object.keys(byDay).sort().map((k) => ({ date: k, revenue: byDay[k] }))
    const byMonthArray = Object.keys(byMonth).sort().map((k) => ({ date: k, revenue: byMonth[k] }))
    const byYearArray = Object.keys(byYear).sort().map((k) => ({ date: k, revenue: byYear[k] }))

    return new Response(JSON.stringify({ totalProducts, totalStores, pendingStores, totalUsers, totalOrders, totalRevenue, byDay: byDayArray, byMonth: byMonthArray, byYear: byYearArray }))
  } catch (err) {
    console.error('Admin dashboard error:', err)
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}
