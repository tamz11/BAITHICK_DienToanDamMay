import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Quét toàn bộ sản phẩm trong Database để hiển thị ra trang chủ công khai
        const products = await prisma.product.findMany({
            where: {
                isDeleted: false // Chỉ lấy sản phẩm chưa bị xóa mềm
            },
            include: {
                rating: true // Nạp kèm bảng đánh giá để không bị sập hàm .reduce() ở trang chủ
            },
            orderBy: {
                createdAt: "desc" // Đẩy sản phẩm mới đăng lên đầu trang
            }
        });
        
        return NextResponse.json(products);
    } catch (error) {
        console.error("Lỗi API public products:", error);
        return NextResponse.json({ error: "Không thể lấy dữ liệu sản phẩm" }, { status: 500 });
    }
}