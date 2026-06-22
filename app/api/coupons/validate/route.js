import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ error: 'Không xác thực được người dùng' }),
        { status: 401 }
      )
    }

    const { code } = await req.json()
    
    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Mã giảm giá không hợp lệ' }),
        { status: 400 }
      )
    }

    // Find coupon by code
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return new Response(
        JSON.stringify({ error: 'Mã giảm giá không tồn tại' }),
        { status: 404 }
      )
    }

    // Check if coupon is expired
    if (new Date(coupon.expiresAt) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Mã giảm giá đã hết hạn' }),
        { status: 400 }
      )
    }

    // Check if coupon is public
    if (!coupon.isPublic) {
      return new Response(
        JSON.stringify({ error: 'Mã giảm giá không khả dụng' }),
        { status: 400 }
      )
    }

    // Check if coupon is for new users or members
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    const ordersCount = user ? await prisma.order.count({ where: { userId: user.id } }) : 0

    if (coupon.forNewUser) {
      if (ordersCount > 0) {
        return new Response(
          JSON.stringify({ error: 'Mã này chỉ dành cho khách hàng mới' }),
          { status: 400 }
        )
      }
    }

    if (coupon.forMember) {
      if (ordersCount < 3) {
        return new Response(
          JSON.stringify({ error: 'Mã này chỉ dành cho hội viên (cần >= 3 đơn)' }),
          { status: 400 }
        )
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          code: coupon.code,
          description: coupon.description,
          discount: coupon.discount,
        },
      }),
      { status: 200 }
    )
  } catch (err) {
    console.error('Coupon validation error:', err)
    return new Response(
      JSON.stringify({ error: 'Lỗi kiểm tra mã giảm giá: ' + err.message }),
      { status: 500 }
    )
  }
}
