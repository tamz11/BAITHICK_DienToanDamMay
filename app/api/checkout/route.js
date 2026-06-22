import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createZohoOrderTask } from '@/lib/zoho' // 🌟 Import Zoho helper

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ error: 'Không xác thực được người dùng' }),
        { status: 401 }
      )
    }

    const {
      addressId,
      paymentMethod,
      items,
      coupon,
      totalPrice,
      storeId,
    } = await req.json()

    // 1. Kiểm tra thông tin bắt buộc
    if (!addressId || !paymentMethod || !items || !Array.isArray(items) || items.length === 0 || !storeId) {
      return new Response(
        JSON.stringify({ error: 'Thông tin đơn hàng không đầy đủ' }),
        { status: 400 }
      )
    }

    // 2. Lấy thông tin người dùng và địa chỉ chi tiết
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { buyerOrders: true }
    })

    const address = await prisma.address.findUnique({
      where: { id: addressId }
    })

    if (!user || !address) {
      return new Response(
        JSON.stringify({ error: 'Người dùng hoặc địa chỉ không tồn tại' }),
        { status: 404 }
      )
    }

    // LOGIC PHÂN LOẠI NGƯỜI DÙNG
    const currentOrderCount = user.buyerOrders.length;
    let userType = currentOrderCount >= 2 ? "MEMBER" : "NEW_USER";

    // 3. Kiểm tra mã giảm giá
    let couponData = null
    if (coupon && coupon.code) {
      const couponRecord = await prisma.coupon.findUnique({
        where: { code: coupon.code.toUpperCase() },
      })
      if (couponRecord) {
        couponData = { code: couponRecord.code, description: couponRecord.description, discount: couponRecord.discount }
      }
    }

    // 4. Tạo đơn hàng vào Database
    const order = await prisma.order.create({
      data: {
        total: totalPrice,
        status: 'ORDER_PLACED',
        userId: user.id,
        storeId,
        addressId,
        paymentMethod,
        isPaid: false,
        isCouponUsed: !!couponData,
        coupon: couponData || {},
        orderItems: {
          createMany: {
            data: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    })

    // 5. Cập nhật kho hàng
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      })
    }

    // 🌟 6. TÍCH HỢP ZOHO PROJECTS: Tạo Task đơn hàng mới với đầy đủ thông tin
    const zohoOrderData = {
        orderId: order.id,
        customerName: address.name,
        phone: address.phone,
        address: `${address.street}, ${address.city}, ${address.state}`,
        total: totalPrice,
        items: order.orderItems.map(item => ({
            name: item.product.name,
            quantity: item.quantity
        }))
    };

    // Gọi bất đồng bộ để không treo UI khách hàng
    createZohoOrderTask(zohoOrderData).catch(err => console.error("Zoho Order Task Error:", err));

    return new Response(
      JSON.stringify({
        success: true,
        message: userType === "MEMBER" && currentOrderCount === 2
            ? 'Chúc mừng! Bạn đã trở thành Thành viên sau đơn hàng này.'
            : 'Đặt hàng thành công',
        data: { orderId: order.id, userType },
      }),
      { status: 201 }
    )
  } catch (err) {
    console.error('Checkout error:', err)
    return new Response(
      JSON.stringify({ error: 'Lỗi đặt hàng: ' + err.message }),
      { status: 500 }
    )
  }
}
