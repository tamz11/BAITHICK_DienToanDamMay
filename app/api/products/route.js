import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        // Gộp điều kiện: Chỉ lấy sản phẩm ĐÃ DUYỆT (của main) và CHƯA BỊ XÓA (của cả 2)
        const whereClause = {
            status: "APPROVED",
            isDeleted: false
        };

        if (category && category !== 'all') {
            whereClause.category = category;
        }

        // Gộp cả include 'rating' của bạn và 'store' của nhánh main
        const products = await prisma.product.findMany({
            where: whereClause,
            include: {
                rating: true, // Bảo vệ hàm .reduce() ở trang chủ của bạn không bị sập
                store: {      // Lấy thông tin shop theo yêu cầu của nhánh main
                    select: {
                        name: true,
                        username: true
                    }
                }
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