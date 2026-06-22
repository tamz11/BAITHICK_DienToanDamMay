import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    // fetch all coupons (we'll filter visibility logic below)
    let coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // if user is authenticated, filter based on forNewUser / forMember rules
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (user) {
        // count orders to determine new-user / member status
        const ordersCount = await prisma.order.count({ where: { userId: user.id } })
        coupons = coupons.filter(c => {
          // skip expired
          if (new Date(c.expiresAt) <= new Date()) return false
          // visible if explicitly public
          if (c.isPublic) return true
          // visible if it's a new-user coupon and user has 0 orders
          if (c.forNewUser && ordersCount === 0) return true
          // visible if it's a member coupon and user has >=3 orders
          if (c.forMember && ordersCount >= 3) return true
          return false
        })
      }
    } else {
      // not authenticated: keep only public coupons that are not expired and not restricted
      coupons = coupons.filter(c => c.isPublic && !c.forMember && !c.forNewUser && new Date(c.expiresAt) > new Date())
    }

    return new Response(JSON.stringify({ coupons }), { status: 200 })
  } catch (err) {
    console.error('Get coupons error:', err)
    return new Response(JSON.stringify({ error: 'Lỗi lấy mã giảm giá' }), { status: 500 })
  }
}
