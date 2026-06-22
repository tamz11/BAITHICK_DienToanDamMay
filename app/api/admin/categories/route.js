import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(req) {
  try {
    await requireAdmin(req)
    const categories = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } })

    // For each category, load its products and include store info
    const categoriesWithProducts = await Promise.all(categories.map(async (c) => {
      const products = await prisma.product.findMany({
        where: { category: c.name },
        include: { store: { select: { id: true, name: true, username: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
      return { ...c, products }
    }))

    return new Response(JSON.stringify({ categories: categoriesWithProducts }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}

export async function POST(req) {
  try {
    await requireAdmin(req)
    const { name } = await req.json()
    if (!name) return new Response(JSON.stringify({ error: 'Missing name' }), { status: 400 })
    const created = await prisma.category.create({ data: { name } })
    return new Response(JSON.stringify({ category: created }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}

export async function PUT(req) {
  try {
    await requireAdmin(req)
    const { id, name } = await req.json()
    if (!id || !name) return new Response(JSON.stringify({ error: 'Missing' }), { status: 400 })
    const updated = await prisma.category.update({ where: { id }, data: { name } })
    return new Response(JSON.stringify({ category: updated }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}

export async function DELETE(req) {
  try {
    await requireAdmin(req)
    const { id, force } = await req.json()
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 })

    const cat = await prisma.category.findUnique({ where: { id } })
    if (!cat) return new Response(JSON.stringify({ error: 'Category not found' }), { status: 404 })

    const productsCount = await prisma.product.count({ where: { category: cat.name } })
    if (productsCount > 0 && !force) {
      return new Response(JSON.stringify({ error: 'Category has products', productsCount }), { status: 400 })
    }

    // If force delete, reassign products' category to empty string before deleting
    if (productsCount > 0 && force) {
      await prisma.product.updateMany({ where: { category: cat.name }, data: { category: '' } })
    }

    await prisma.category.delete({ where: { id } })
    return new Response(JSON.stringify({ success: true }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: err.status || 500 })
  }
}
