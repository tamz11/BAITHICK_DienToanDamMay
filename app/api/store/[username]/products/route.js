import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const { username } = params
    if (!username) {
      return NextResponse.json({ error: 'Username cửa hàng không được để trống' }, { status: 400 })
    }

    const store = await prisma.store.findUnique({
      where: { username },
    })

    if (!store) {
      return NextResponse.json({ error: 'Cửa hàng không tồn tại' }, { status: 404 })
    }

    const products = await prisma.product.findMany({
      where: {
        storeId: store.id,
        isDeleted: false,
        status: 'APPROVED',
      },
      include: {
        store: {
          select: {
            name: true,
            username: true,
            address: true,
            email: true,
          },
        },
        rating: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ store, products })
  } catch (err) {
    console.error('Store products error:', err)
    return NextResponse.json({ error: 'Lỗi hệ thống khi lấy sản phẩm của cửa hàng' }, { status: 500 })
  }
}
