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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingProductsCount, pendingOrdersCount, totalStores, todayOrdersCount, pendingProducts, pendingOrders, recentActivity] = await Promise.all([
      // 1. Số lượng sản phẩm chờ duyệt
      prisma.product.count({ where: { status: 'PENDING', isDeleted: false } }),

      // 2. Số lượng đơn hàng mới (chưa xác nhận)
      prisma.order.count({ where: { status: 'ORDER_PLACED' } }),

      // 3. Tổng số cửa hàng
      prisma.store.count({ where: { isActive: true } }),

      // 4. Đơn hàng mới trong ngày
      prisma.order.count({ where: { createdAt: { gte: today } } }),

      // 5. Danh sách sản phẩm chờ duyệt mới nhất
      prisma.product.findMany({
        where: { status: 'PENDING', isDeleted: false },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, createdAt: true }
      }),

      // 6. Danh sách đơn hàng mới (Chứa đầy đủ thông tin khách hàng, địa chỉ, sản phẩm)
      prisma.order.findMany({
        where: { status: 'ORDER_PLACED' },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true, email: true } },
            address: true,
            orderItems: {
                include: { product: { select: { name: true } } }
            }
        }
      }),

      // 7. Hoạt động gần đây (Đơn hàng vừa cập nhật trạng thái)
      prisma.order.findMany({
        where: { NOT: { status: 'ORDER_PLACED' } },
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { user: { select: { name: true } } }
      })
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        pendingProducts: pendingProductsCount,
        pendingOrders: pendingOrdersCount,
        activeSellers: totalStores,
        todayOrders: todayOrdersCount
      },
      pendingProducts,
      pendingOrders,
      recentActivity
    })
  } catch (err) {
    console.error('Staff stats error:', err)
    return NextResponse.json({ error: 'Lỗi lấy thống kê hệ thống' }, { status: 500 })
  }
}
