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

<<<<<<< HEAD
    // Normalize coupon code: remove spaces and uppercase
    const couponCode = code.replace(/\s+/g, '').toUpperCase()

    // Find coupon by normalized code
    let coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    })

    if (!coupon) {
      coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
        },
      })
    }

    if (!coupon) {
=======
    // Find coupon by code
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
>>>>>>> 5e6f11fbe23afe2ef2180f979c7d843b9b483f09
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

<<<<<<< HEAD
    // Check if coupon is public or private but available for this user
    if (!coupon.isPublic) {
      if (coupon.forNewUser) {
        const userOrders = await prisma.order.findFirst({
          where: {
            user: { email: session.user.email },
          },
        })
        if (userOrders) {
          return new Response(
            JSON.stringify({ error: 'Mã này chỉ dành cho khách hàng mới' }),
            { status: 400 }
          )
        }
      } else if (coupon.forMember) {
        // Allow member-only coupons for authenticated users.
      } else {
        return new Response(
          JSON.stringify({ error: 'Mã giảm giá không khả dụng' }),
=======
    // Check if coupon is public
    if (!coupon.isPublic) {
      return new Response(
        JSON.stringify({ error: 'Mã giảm giá không khả dụng' }),
        { status: 400 }
      )
    }

    // Check if coupon is for new users
    if (coupon.forNewUser) {
      const userOrders = await prisma.order.findFirst({
        where: {
          user: { email: session.user.email },
        },
      })
      if (userOrders) {
        return new Response(
          JSON.stringify({ error: 'Mã này chỉ dành cho khách hàng mới' }),
>>>>>>> 5e6f11fbe23afe2ef2180f979c7d843b9b483f09
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
