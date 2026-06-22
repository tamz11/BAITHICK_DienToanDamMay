import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(req) {
  try {
    await requireAdmin(req)
    // Basic order totals and revenue by day
    const orders = await prisma.order.findMany({ select: { total: true, createdAt: true } })

    const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0)
    const totalOrders = orders.length

    const byDay = {}
    orders.forEach((o) => {
      const d = o.createdAt.toISOString().slice(0, 10)
      byDay[d] = (byDay[d] || 0) + (o.total || 0)
    })

    const byDayArray = Object.keys(byDay).sort().map((k) => ({ date: k, revenue: byDay[k] }))

    // Sales breakdown: which store sold which products and statuses
    const items = await prisma.orderItem.findMany({
      include: {
        order: { select: { storeId: true, status: true } },
        product: { select: { id: true, name: true, status: true, images: true } }
      }
    })

    const byStore = {}
    for (const it of items) {
      const storeId = it.order?.storeId
      if (!storeId) continue

      byStore[storeId] = byStore[storeId] || {}
      const prod = byStore[storeId][it.productId] || {
        productId: it.productId,
        name: it.product?.name || 'Unknown',
        productStatus: it.product?.status || null,
        images: it.product?.images,
        quantity: 0,
        orderStatusCounts: {}
      }
      prod.quantity += it.quantity || 0
      const ordStatus = it.order?.status || 'UNKNOWN'
      prod.orderStatusCounts[ordStatus] = (prod.orderStatusCounts[ordStatus] || 0) + 1
      byStore[storeId][it.productId] = prod
    }

    const storeIds = Object.keys(byStore)
    const stores = storeIds.length ? await prisma.store.findMany({ where: { id: { in: storeIds } }, select: { id: true, name: true, username: true, logo: true } }) : []

    const salesByStore = stores.map(s => ({ store: s, products: Object.values(byStore[s.id] || {}).sort((a,b) => b.quantity - a.quantity) }))

    return new Response(JSON.stringify({ totalRevenue, totalOrders, byDay: byDayArray, salesByStore }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}
