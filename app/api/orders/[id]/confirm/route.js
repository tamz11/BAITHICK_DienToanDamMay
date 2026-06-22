import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: 'Chỉ khách hàng mới có thể xác nhận nhận hàng' }, { status: 403 })
    }

    const order = await prisma.order.findUnique({ where: { id } })

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 })
    }

    if (order.status !== 'SHIPPED') {
      return NextResponse.json({ error: 'Đơn hàng chưa được giao đi' }, { status: 400 })
    }

    // Cập nhật trạng thái thành Đã giao
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'DELIVERED',
        isPaid: true // Khách xác nhận coi như tiền đã thu xong
      },
    })

    return NextResponse.json({ success: true, message: 'Xác nhận thành công', data: updatedOrder })
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi hệ thống: ' + err.message }, { status: 500 })
  }
}
