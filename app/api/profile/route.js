import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Không xác thực được người dùng' }), { status: 401 })
    }

    const body = await req.json()
    const { name, image, currentPassword, newPassword, confirmNewPassword } = body

    if (!name) {
      return new Response(JSON.stringify({ error: 'Tên không được để trống' }), { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return new Response(JSON.stringify({ error: 'Người dùng không tồn tại' }), { status: 404 })
    }

    const updateData = { name, image: image || user.image }

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

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    })

    return new Response(JSON.stringify({ message: 'Cập nhật thành công', user: { name: updatedUser.name, email: updatedUser.email, image: updatedUser.image } }), { status: 200 })
  } catch (err) {
    console.error('Profile update error:', err)
    return new Response(JSON.stringify({ error: 'Lỗi cập nhật hồ sơ: ' + err.message }), { status: 500 })
  }
}
