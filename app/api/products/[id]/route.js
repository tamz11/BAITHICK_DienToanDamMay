import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// API công khai lấy chi tiết 1 sản phẩm theo ID cho khách xem
export async function GET(req, { params }) {
    try {
        // Next.js 15 bắt buộc phải await params trước khi lấy ID
        const { id } = await params;

        const product = await prisma.product.findUnique({
            where: { 
                id: id,
                isDeleted: false // Đảm bảo sản phẩm chưa bị ẩn/xóa mềm
            },
            include: {
                rating: true, // Nạp kèm bảng đánh giá để không bị sập giao diện sao
                store: true   // Nạp kèm thông tin shop để hiện tên cửa hàng nếu cần
            }
        });

        if (!product) {
            return NextResponse.json({ error: "Sản phẩm không tồn tại hoặc đã ngừng bán" }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("Lỗi API chi tiết sản phẩm công khai:", error);
        return NextResponse.json({ error: "Lỗi hệ thống không thể đọc Database" }, { status: 500 });
    }
}