import { NextResponse } from "next/server";
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const products = await prisma.product.findMany({
            where: {
                status: "APPROVED",
                isDeleted: false
            },
            include: {
                store: {
                    select: {
                        name: true,
                        username: true
                    }
                },
                rating: true
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm:", error);
        return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
    }
}
