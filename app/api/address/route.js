import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Không xác thực được người dùng' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 })
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: addresses })
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi lấy địa chỉ: ' + err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Không xác thực được người dùng' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 })
    }

    const body = await req.json()
    const { name, email, street, city, state, zip, country, phone } = body

    if (!name || !street || !city || !phone) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ các thông tin bắt buộc' }, { status: 400 })
    }

    const newAddress = await prisma.address.create({
      data: {
        name,
        email,
        street,
        city,
        state,
        zip: String(zip),
        country,
        phone,
        userId: user.id
      }
    })

    return NextResponse.json({ success: true, data: newAddress }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi thêm địa chỉ: ' + err.message }, { status: 500 })
  }
}
