import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, email, password, confirmPassword } = body
    
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
        role: (body.store && body.store.username) ? 'STORE_OWNER' : 'CUSTOMER',
        cart: {}
      } 
    })

    let storeCreated = null
    if (body.store && body.store.username) {
      const s = body.store
      // create store application
      try {
        storeCreated = await prisma.store.create({ data: {
          userId: user.id,
          name: s.name || (user.name + "'s store"),
          username: s.username,
          description: s.description || '',
          address: s.address || '',
          status: 'pending',
          isActive: false,
          logo: s.logo || '',
          email: s.email || user.email,
          contact: s.contact || ''
        }})
      } catch (e) {
        // if store creation fails (e.g., username duplicate), delete user and return error
        await prisma.user.delete({ where: { id: user.id } }).catch(()=>{})
        return new Response(JSON.stringify({ error: 'Lỗi tạo hồ sơ cửa hàng: ' + (e.message || e) }), { status: 400 })
      }
    }

    return new Response(JSON.stringify({ message: 'Đăng ký thành công', user: { id: user.id, email: user.email, name: user.name }, store: storeCreated ? { id: storeCreated.id, status: storeCreated.status } : null }), { status: 201 })
  } catch (err) {
    console.error('Signup error:', err)
    return new Response(JSON.stringify({ error: 'Lỗi đăng ký: ' + err.message }), { status: 500 })
  }
}
