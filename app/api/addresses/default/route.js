import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new Response(JSON.stringify({ error: 'Không xác thực' }), { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return new Response(JSON.stringify({ error: 'Người dùng không tồn tại' }), { status: 404 })

    const body = await req.json()
    const { addressId } = body
    if (!addressId) return new Response(JSON.stringify({ error: 'Thiếu addressId' }), { status: 400 })

    // verify address belongs to user
    const addr = await prisma.address.findUnique({ where: { id: addressId } })
    if (!addr || addr.userId !== user.id) return new Response(JSON.stringify({ error: 'Địa chỉ không hợp lệ' }), { status: 403 })

    await prisma.user.update({ where: { id: user.id }, data: { defaultAddressId: addressId } })

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err) {
    console.error('Set default address error:', err)
    return new Response(JSON.stringify({ error: 'Lỗi server' }), { status: 500 })
  }
}
