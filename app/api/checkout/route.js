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

    const {
      addressId,
      paymentMethod,
      items,
      coupon,
      totalPrice,
      storeId,
      address: addressData,
    } = await req.json();

    // Validate required fields
    if (!addressId || !paymentMethod || !items || !Array.isArray(items) || items.length === 0 || !storeId) {
      return new Response(
        JSON.stringify({ error: 'Thông tin đơn hàng không đầy đủ' }),
        { status: 400 }
      )
    }

    // Validate payment method
    if (!['COD', 'STRIPE'].includes(paymentMethod)) {
      return new Response(
        JSON.stringify({ error: 'Phương thức thanh toán không hợp lệ' }),
        { status: 400 }
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

    // Validate address
    let existingAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existingAddress && addressId && addressData && typeof addressData === 'object') {
      const requiredFields = ['name', 'email', 'street', 'city', 'state', 'zip', 'country', 'phone']
      const validAddress = requiredFields.every((field) => Boolean(addressData[field]))
      if (!validAddress) {
        return new Response(
          JSON.stringify({ error: 'Địa chỉ không hợp lệ' }),
          { status: 400 }
        )
      }

      existingAddress = await prisma.address.create({
        data: {
          id: addressId,
          userId: user.id,
          name: addressData.name,
          email: addressData.email,
          street: addressData.street,
          city: addressData.city,
          state: addressData.state,
          zip: addressData.zip,
          country: addressData.country,
          phone: addressData.phone,
        },
      })
    }

    if (!existingAddress || existingAddress.userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Địa chỉ không hợp lệ' }),
        { status: 400 }
      )
    }

    // Validate products and stock
    const productIds = items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== items.length) {
      const foundIds = products.map(p => p.id);
      const missing = productIds.filter(id => !foundIds.includes(id));
      return new Response(
        JSON.stringify({ error: 'Một số sản phẩm không tồn tại', missing }),
        { status: 400 }
      );
    }

    // Validate stock
    for (const item of items) {
      const product = products.find(p => p.id === item.productId)
      if (!product || product.stock < item.quantity) {
        return new Response(
          JSON.stringify({ error: `Sản phẩm "${product?.name}" không đủ hàng` }),
          { status: 400 }
        )
      }
    }

    // Validate coupon if provided
    let couponData = null
    if (coupon && coupon.code) {
      const normalizedCode = String(coupon.code).replace(/\s+/g, '').toUpperCase();
      const couponRecord = await prisma.coupon.findUnique({
        where: { code: normalizedCode },
      });

      if (!couponRecord || new Date(couponRecord.expiresAt) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Mã giảm giá không hợp lệ hoặc hết hạn' }),
          { status: 400 }
        )
      }
      couponData = {
        code: couponRecord.code,
        description: couponRecord.description,
        discount: couponRecord.discount,
      }
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        total: totalPrice,
        status: 'ORDER_PLACED',
        userId: user.id,
        storeId,
        addressId,
        paymentMethod,
        isPaid: paymentMethod === 'STRIPE' ? false : false, // For COD: false, For Stripe: false initially
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
          include: {
            product: true,
          },
        },
        address: true,
        store: true,
      },
    })

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Đặt hàng thành công',
        data: {
          orderId: order.id,
          total: order.total,
          status: order.status,
          paymentMethod: order.paymentMethod,
        },
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
