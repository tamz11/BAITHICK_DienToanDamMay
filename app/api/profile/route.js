import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
// Sử dụng đường dẫn tuyệt đối @/ để tránh lỗi "Module not found"
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Không xác thực được người dùng' }), { status: 401 })
    }

    const body = await req.json()
    const { name, image, phone, ewallet, currentPassword, newPassword, confirmNewPassword } = body

    // Only validate name when provided in the request body
    if (body.hasOwnProperty('name') && !name) {
      return new Response(JSON.stringify({ error: 'Tên không được để trống' }), { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return new Response(JSON.stringify({ error: 'Người dùng không tồn tại' }), { status: 404 })
    }

    // Build update data only with provided fields to allow partial updates (e.g., only image)
    const updateData = {}
    if (body.hasOwnProperty('name')) updateData.name = name
    if (body.hasOwnProperty('image')) updateData.image = image || user.image
    if (body.hasOwnProperty('phone')) updateData.phone = phone ?? user.phone
    if (body.hasOwnProperty('ewallet')) updateData.ewallet = ewallet ?? user.ewallet

    if (newPassword || confirmNewPassword || currentPassword) {
      if (!currentPassword) {
        return new Response(JSON.stringify({ error: 'Cần mật khẩu hiện tại để đổi mật khẩu' }), { status: 400 })
      }

      const validPassword = await bcrypt.compare(currentPassword, user.password)
      if (!validPassword) {
        return new Response(JSON.stringify({ error: 'Mật khẩu hiện tại không chính xác' }), { status: 403 })
      }

      if (newPassword !== confirmNewPassword) {
        return new Response(JSON.stringify({ error: 'Mật khẩu mới và xác nhận không khớp' }), { status: 400 })
      }

      if (newPassword.length < 6) {
        return new Response(JSON.stringify({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' }), { status: 400 })
      }

      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    let updatedUser
    try {
      updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: updateData,
      })
    } catch (err) {
      // If Prisma client was generated before adding `phone`/`ewallet`, it may reject unknown fields.
      // Retry update without phone/ewallet to avoid breaking user updates until client is regenerated.
      const msg = String(err?.message || '').toLowerCase()
      if (msg.includes('unknown arg') || msg.includes('unknown field') || msg.includes('provided value for a relation')) {
        const fallback = { name, image: image || user.image }
        if (updateData.password) fallback.password = updateData.password
        updatedUser = await prisma.user.update({ where: { email: session.user.email }, data: fallback })
      } else {
        throw err
      }
    }

    return new Response(JSON.stringify({ message: 'Cập nhật thành công', user: { name: updatedUser.name, email: updatedUser.email, image: updatedUser.image } }), { status: 200 })
  } catch (err) {
    console.error('Profile update error:', err)
    return new Response(JSON.stringify({ error: 'Lỗi cập nhật hồ sơ: ' + err.message }), { status: 500 })
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Không xác thực được người dùng' }), { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return new Response(JSON.stringify({ error: 'Người dùng không tồn tại' }), { status: 404 })

    // return public fields only
    const { name, email, image, phone, ewallet } = user
    return new Response(JSON.stringify({ user: { name, email, image, phone, ewallet } }), { status: 200 })
  } catch (err) {
    console.error('Profile GET error:', err)
    return new Response(JSON.stringify({ error: 'Lỗi lấy hồ sơ: ' + err.message }), { status: 500 })
  }
}
