import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    // Lấy số đơn hàng của khách để biết họ có được dùng mã NewUser/Member không
    let orderCount = 0;
    if (session?.user?.email) {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (user) {
            orderCount = await prisma.order.count({
                where: { userId: user.id }
            });
        }
    }

    const coupons = await prisma.coupon.findMany({
      where: {
        isPublic: true,
        expiresAt: { gte: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Gắn thêm trạng thái "khả dụng" cho từng mã dựa trên loại khách hàng
    // Logic: forNewUser chỉ dành cho 0 đơn. forMember dành cho >= 2 đơn (đơn đang đặt là đơn thứ 3)
    const availableCoupons = coupons.map(c => ({
        ...c,
        isEligible: (c.forNewUser ? orderCount === 0 : true) && (c.forMember ? orderCount >= 2 : true)
    }));

    return NextResponse.json({ success: true, data: availableCoupons });
  } catch (err) {
    console.error('Get coupons error:', err)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}
