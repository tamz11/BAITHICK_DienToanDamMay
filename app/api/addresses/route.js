import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new Response(JSON.stringify({ addresses: [] }), { status: 200 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return new Response(JSON.stringify({ addresses: [] }), { status: 200 })

    let addresses = await prisma.address.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })

    // If user has no addresses, create a default one from profile info
    if (!addresses || addresses.length === 0) {
      const created = await prisma.address.create({ data: {
        userId: user.id,
        name: user.name || user.email,
        email: user.email,
        street: 'Chưa có địa chỉ',
        city: 'Chưa có',
        state: '',
        zip: '',
        country: 'VN',
        phone: user.phone || ''
      }})
      addresses = [created]
      // also update user's profile? (keep profile fields in sync: no user.addressId field exists)
    }

    return new Response(JSON.stringify({ addresses }), { status: 200 })
  } catch (err) {
    console.error('Addresses GET error:', err)
    return new Response(JSON.stringify({ error: 'Lỗi lấy địa chỉ' }), { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Không xác thực' }), { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return new Response(JSON.stringify({ error: 'Người dùng không tồn tại' }), { status: 404 })

    const body = await req.json()
    const { name, email, street, city, state, zip, country, phone } = body
    if (!name || !street || !city) return new Response(JSON.stringify({ error: 'Thiếu trường bắt buộc' }), { status: 400 })

    const created = await prisma.address.create({ data: {
      userId: user.id,
      name,
      email: email || user.email,
      street,
      city,
      state: state || '',
      zip: zip || '',
      country: country || '',
      phone: phone || ''
    }})
    // If user has no defaultAddressId, set this newly created as default
    if (!user.defaultAddressId) {
      await prisma.user.update({ where: { id: user.id }, data: { defaultAddressId: created.id } })
    }

    return new Response(JSON.stringify({ address: created }), { status: 201 })
  } catch (err) {
    console.error('Addresses POST error:', err)
    return new Response(JSON.stringify({ error: 'Lỗi lưu địa chỉ' }), { status: 500 })
  }
}
