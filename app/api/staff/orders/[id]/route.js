import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function PATCH(req, { params }) {
  try {
    // Trong Next.js 15+, params là một Promise và cần được await
    const { id } = await params;

    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "STAFF") {
      return NextResponse.json({ error: 'Từ chối quyền truy cập' }, { status: 403 })
    }

    const { status } = await req.json()

    const validStatuses = ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Trạng thái không hợp lệ' }, { status: 400 })
    }

    // Cập nhật trạng thái đơn hàng
    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: {
        status: status,
        // Nếu chuyển sang DELIVERED, tự động đánh dấu đã thanh toán nếu là COD
        ...(status === 'DELIVERED' ? { isPaid: true } : {})
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: updatedOrder
    })

  } catch (err) {
    console.error('Staff update order error:', err)
    return NextResponse.json({ error: 'Lỗi cập nhật đơn hàng: ' + err.message }, { status: 500 })
  }
}
