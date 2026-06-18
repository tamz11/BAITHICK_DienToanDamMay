import { NextResponse } from "next/server";
import prisma from '@/lib/prisma'

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        // Chỉ lấy sản phẩm đã được DUYỆT và chưa bị XÓA
        const whereClause = {
            status: "APPROVED",
            isDeleted: false
        };

        if (category && category !== 'all') {
            whereClause.category = category;
        }

        const products = await prisma.product.findMany({
            where: whereClause,
            include: {
                store: {
                    select: {
                        name: true,
                        username: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm:", error);
        return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
    }
}
