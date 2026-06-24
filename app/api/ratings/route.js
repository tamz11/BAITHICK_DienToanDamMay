export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

// 1. Hàm LẤY danh sách đánh giá của User đang đăng nhập (GET)
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Bạn chưa đăng nhập!" }, { status: 401 });
        }

        const userRatings = await prisma.rating.findMany({
            where: {
                userId: session.user.id 
            },
            include: {
                product: true
            },
            orderBy: {
                createdAt: 'desc' 
            }
        });

        return NextResponse.json({ ratings: userRatings }, { status: 200 });
    } catch (error) {
        console.error("LỖI API GET RATINGS:", error);
        return NextResponse.json({ error: "Lỗi nội bộ Server Backend" }, { status: 500 });
    }
}

// 2. Hàm GỬI đánh giá mới từ đơn hàng lên (POST)
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Bạn chưa đăng nhập!" }, { status: 401 });
        }

        const body = await request.json();
        const { orderId, productId, rating, review } = body;

        // Ràng buộc dữ liệu đầu vào cơ bản
        if (!orderId || !productId || !rating) {
            return NextResponse.json({ error: "Thiếu thông tin đánh giá bắt buộc" }, { status: 400 });
        }

        // 🌟 CẢI TIẾN 1: Kiểm tra xem sản phẩm này trong đơn này đã được đánh giá chưa
        // Giúp chặn đứng lỗi sập gãy Database (Unique Constraint) và trả về thông báo mịn màng
        const existingRating = await prisma.rating.findFirst({
            where: {
                orderId: orderId,
                productId: productId,
                userId: session.user.id
            }
        });

        if (existingRating) {
            return NextResponse.json({ error: "Sản phẩm trong đơn hàng này bạn đã đánh giá rồi!" }, { status: 400 });
        }

        // Bước 2: Tạo bản ghi đánh giá mới trong Database
        const createdRating = await prisma.rating.create({
            data: {
                userId: session.user.id,
                orderId: orderId,
                productId: productId,
                rating: Number(rating), 
                review: review || ""
            }
        });

        // 🌟 CẢI TIẾN 2: Truy vấn lại bản ghi vừa tạo để ép include bảng product vào
        // Giúp Frontend lập tức nhận được tên sản phẩm thật, không bao giờ bị hiện "Sản phẩm không tồn tại" nữa
        const newRating = await prisma.rating.findUnique({
            where: {
                id: createdRating.id
            },
            include: {
                product: true
            }
        });
        
        return NextResponse.json({ success: true, message: "Đã lưu đánh giá mới thành công!", data: newRating }, { status: 201 });
    } catch (error) {
        console.error("LỖI API POST RATING:", error);
        return NextResponse.json({ error: "Lỗi xử lý lưu đánh giá lên hệ thống" }, { status: 500 });
    }
}