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

    // 1. Tìm coupon trong DB
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return new Response(
        JSON.stringify({ error: 'Mã giảm giá không tồn tại' }),
        { status: 404 }
      )
    }

    // 2. Kiểm tra hạn sử dụng
    if (new Date(coupon.expiresAt) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Mã giảm giá đã hết hạn' }),
        { status: 400 }
      )
    }

    // 3. Kiểm tra tính công khai
    if (!coupon.isPublic) {
      return new Response(
        JSON.stringify({ error: 'Mã giảm giá không khả dụng hiện tại' }),
        { status: 400 }
      )
    }

    // 4. Lấy số lượng đơn hàng cũ của khách để kiểm tra điều kiện
    const orderCount = await prisma.order.count({
      where: {
        user: { email: session.user.email },
      },
    })

    // 🌟 LOGIC PHÂN LOẠI THEO ĐƠN HÀNG:

    // Kiểm tra nếu là mã cho người mới (Chỉ dùng cho đơn đầu tiên)
    if (coupon.forNewUser && orderCount > 0) {
      return new Response(
        JSON.stringify({ error: 'Mã này chỉ dành cho khách hàng mới (đơn hàng đầu tiên)' }),
        { status: 400 }
      )
    }

    // Kiểm tra nếu là mã cho Thành viên (Chỉ dùng từ đơn thứ 3 trở đi)
    if (coupon.forMember && orderCount < 2) {
      return new Response(
        JSON.stringify({ error: 'Mã này chỉ dành cho Thành viên (bạn cần hoàn thành ít nhất 2 đơn hàng trước đó)' }),
        { status: 400 }
      )
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
      JSON.stringify({ error: 'Lỗi hệ thống: ' + err.message }),
      { status: 500 }
    )
  }
}
