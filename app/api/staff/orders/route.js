import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "STAFF") {
      return NextResponse.json({ error: 'Từ chối quyền truy cập' }, { status: 403 })
    }

    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        address: true,
        store: true,
        user: {
          select: {
            name: true,
            email: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: orders })
  } catch (err) {
    console.error('Staff fetch orders error:', err)
    return NextResponse.json({ error: 'Lỗi lấy đơn hàng: ' + err.message }, { status: 500 })
  }
}
