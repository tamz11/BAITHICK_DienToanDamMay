import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        // Lấy query tham số category trên thanh URL (Ví dụ: ?category=Laptop)
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        // Gộp điều kiện: Chỉ lấy sản phẩm ĐÃ DUYỆT và CHƯA BỊ XÓA MỀM
        const whereClause = {
            status: "APPROVED",
            isDeleted: false
        };

        // Nếu khách chọn một danh mục cụ thể (và không phải là chọn 'all'), nạp thêm vào bộ lọc DB
        if (category && category !== 'all') {
            whereClause.category = category;
        }
        const products = await prisma.product.findMany({
            where: whereClause, // ➔ ĐÃ FIX 2: Truyền bộ lọc động vào đây để chạy được tính năng chọn danh mục
            include: {
                rating: true,   // ➔ ĐÃ FIX 3: Chỉ giữ 1 dòng rating để tránh sập hàm .reduce() trang chủ của bạn
                store: {        // Lấy thông tin shop theo đúng yêu cầu của nhánh main để hiển thị tên shop
                    select: {
                        name: true,
                        username: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc" // Đẩy sản phẩm mới đăng lên đầu trang chủ
            }
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("Lỗi API public products:", error);
        return NextResponse.json({ error: "Không thể lấy dữ liệu sản phẩm" }, { status: 500 });
    }
}