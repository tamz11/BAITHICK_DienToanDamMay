import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const { name, email, password, confirmPassword } = await req.json()
    
    if (!email || !name || !password) {
      return new Response(JSON.stringify({ error: 'Vui lòng điền đầy đủ thông tin' }), { status: 400 })
    }

    if (password !== confirmPassword) {
      return new Response(JSON.stringify({ error: 'Mật khẩu xác nhận không khớp' }), { status: 400 })
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: 'Mật khẩu phải ít nhất 6 ký tự' }), { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return new Response(JSON.stringify({ error: 'Email đã được đăng ký' }), { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ 
      data: { 
        id: nanoid(),
        name, 
        email, 
        password: hashed,
        role: 'CUSTOMER'
      } 
    })
    
    return new Response(JSON.stringify({ message: 'Đăng ký thành công', user: { id: user.id, email: user.email, name: user.name } }), { status: 201 })
  } catch (err) {
    console.error('Signup error:', err)
    return new Response(JSON.stringify({ error: 'Lỗi đăng ký: ' + err.message }), { status: 500 })
  }
}
