import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@/app/generated/prisma"; // Thư mục sinh Client của bạn
import { nanoid } from "nanoid";

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export async function POST(req) {
    try {
        const { name, email, password, storeName } = await req.json();

        // Kiểm tra dữ liệu đầu vào
        if (!name || !email || !password || !storeName) {
            return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin bắt buộc" }, { status: 400 });
        }

        // 1. Kiểm tra email đã tồn tại chưa
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "Email này đã được sử dụng" }, { status: 400 });
        }

        // 2. Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = `user_${nanoid(10)}`; // Tạo ID vì trường id của User trong schema là chuỗi String

        // 3. Chạy Transaction tạo cả User và Store cùng lúc để tránh lỗi đồng bộ
        await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    id: userId,
                    name,
                    email,
                    password: hashedPassword,
                    role: "STORE_OWNER", // Gán quyền chủ cửa hàng
                    image: ""
                }
            });

            await tx.store.create({
                data: {
                    userId: newUser.id,
                    name: storeName,
                    username: `store_${nanoid(6)}`, // Tạo username độc nhất cho store
                    description: "Chưa có mô tả cửa hàng",
                    address: "Chưa cập nhật địa chỉ kho",
                    logo: "",
                    email: newUser.email,
                    contact: "Chưa cập nhật SĐT"
                }
            });
        });

        return NextResponse.json({ message: "Đăng ký tài khoản người bán thành công!" }, { status: 201 });

    } catch (error) {
        console.error("Lỗi đăng ký Seller:", error);
        return NextResponse.json({ error: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
    }
}