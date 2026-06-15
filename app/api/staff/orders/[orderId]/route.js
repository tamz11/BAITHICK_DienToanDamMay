import prisma from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function PATCH(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    const user = await getUserFromToken(token)
    if (!user || !['ADMIN', 'STAFF', 'STORE_OWNER'].includes(user.role)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 })
    }

    const { status } = await req.json()
    if (!status) return new Response(JSON.stringify({ error: 'Missing status' }), { status: 400 })

    const updated = await prisma.order.update({ where: { id: params.orderId }, data: { status } })
    return new Response(JSON.stringify({ order: updated }))
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
