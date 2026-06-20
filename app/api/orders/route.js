import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ error: 'Không xác thực được người dùng' }),
        { status: 401 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Người dùng không tồn tại' }),
        { status: 404 }
      )
    }

    // Fetch orders with related data
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        address: true,
        store: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return new Response(
      JSON.stringify({ 
        success: true,
        data: orders,
        count: orders.length 
      }),
      { status: 200 }
    )
  } catch (err) {
    console.error('Fetch orders error:', err)
    return new Response(
      JSON.stringify({ error: 'Lỗi lấy danh sách đơn hàng: ' + err.message }),
      { status: 500 }
    )
  }
}
