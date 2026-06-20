import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Không xác thực được người dùng' }), { status: 401 })
    }

    const { productId, orderId, rating, review } = await req.json()

    if (!productId || !orderId || !rating) {
      return new Response(JSON.stringify({ error: 'Thiếu thông tin đánh giá' }), { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: 'Đánh giá phải từ 1 đến 5 sao' }), { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return new Response(JSON.stringify({ error: 'Người dùng không tồn tại' }), { status: 404 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true }
    })

    if (!order || order.userId !== user.id) {
      return new Response(JSON.stringify({ error: 'Đơn hàng không hợp lệ' }), { status: 400 })
    }

    const item = order.orderItems.find((item) => item.productId === productId)
    if (!item) {
      return new Response(JSON.stringify({ error: 'Sản phẩm không tồn tại trong đơn hàng' }), { status: 400 })
    }

    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_productId_orderId: {
          userId: user.id,
          productId,
          orderId,
        },
      },
    })

    if (existingRating) {
      return new Response(JSON.stringify({ error: 'Bạn đã đánh giá sản phẩm này rồi' }), { status: 400 })
    }

    const created = await prisma.rating.create({
      data: {
        rating,
        review: review || '',
        userId: user.id,
        productId,
        orderId,
      },
      include: {
        user: true,
      },
    })

    return new Response(JSON.stringify({ success: true, data: created }), { status: 201 })
  } catch (err) {
    console.error('Rating submission error:', err)
    return new Response(JSON.stringify({ error: err.message || 'Lỗi gửi đánh giá' }), { status: 500 })
  }
}
