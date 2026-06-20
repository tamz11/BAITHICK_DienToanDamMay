import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from '@/lib/prisma'
import { nanoid } from "nanoid";

export async function POST(req) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "Email này đã được sử dụng" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                id: nanoid(),
                name,
                email,
                password: hashedPassword,
                role: "STAFF",
                cart: {}
            }
        });

        return NextResponse.json({
            message: "Đăng ký tài khoản nhân viên thành công!",
            user: { id: user.id, email: user.email }
        }, { status: 201 });

    } catch (error) {
        console.error("Lỗi đăng ký Staff:", error);
        return NextResponse.json({ error: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
    }
}
