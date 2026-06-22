import prisma from '@/lib/prisma'

export async function GET(req) {
  try {
    const categories = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } })

    const categoriesWithStores = await Promise.all(categories.map(async (c) => {
      const products = await prisma.product.findMany({
        where: { category: c.name },
        include: { store: { select: { id: true, name: true, username: true } } },
        take: 50
      })
      const storeMap = {}
      products.forEach(p => { if (p.store) storeMap[p.store.id] = p.store })
      const stores = Object.values(storeMap)
      return { id: c.id, name: c.name, stores }
    }))

    return new Response(JSON.stringify({ categories: categoriesWithStores }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: 500 })
  }
}
