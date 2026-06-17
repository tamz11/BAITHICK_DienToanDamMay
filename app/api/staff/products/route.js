import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from '@/lib/prisma'

// Lấy danh sách sản phẩm chờ duyệt
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "STAFF" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Từ chối quyền truy cập" }, { status: 403 });
        }

        const products = await prisma.product.findMany({
            where: {
                status: "PENDING",
                isDeleted: false
            },
            include: {
                store: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("Lỗi GET staff products:", error);
        return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
    }
}

// Cập nhật trạng thái sản phẩm (Duyệt/Từ chối)
export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "STAFF" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Từ chối quyền truy cập" }, { status: 403 });
        }

        const { productId, status } = await req.json();

        if (!productId || !["APPROVED", "REJECTED"].includes(status)) {
            return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
        }

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: { status: status }
        });

        return NextResponse.json({ message: "Cập nhật trạng thái thành công", product: updatedProduct });
    } catch (error) {
        console.error("Lỗi PATCH staff products:", error);
        return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
    }
}
