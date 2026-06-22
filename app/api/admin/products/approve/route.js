// app/api/admin/products/approve/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 1. Hàm helper lấy Access Token cho tài khoản Zoho Books (Tài khoản 1)
async function getZohoBooksToken() {
    try {
        const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                refresh_token: process.env.ZOHO_REFRESH_TOKEN, // Mã dòng 27 .env của bạn
                client_id: process.env.ZOHO_CLIENT_ID,
                client_secret: process.env.ZOHO_CLIENT_SECRET,
                grant_type: 'refresh_token',
            }),
        });
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Lỗi lấy token Zoho Books:", error);
        return null;
    }
}

// 2. API xử lý hành động Duyệt sản phẩm từ giao diện Admin/Staff
export async function POST(req) {
    try {
        const body = await req.json();
        const { productId } = body; // Nhận ID sản phẩm cần duyệt từ client

        // Tìm thông tin sản phẩm trong database local
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
        }

        // Lấy Token để nói chuyện với Zoho Books
        const accessToken = await getZohoBooksToken();
        if (!accessToken) {
            return NextResponse.json({ error: "Lỗi xác thực Zoho Books" }, { status: 500 });
        }

        // 🚀 TIẾN HÀNH ĐẨY SẢN PHẨM SANG ZOHO BOOKS
        const zohoRes = await fetch(`https://www.zohoapis.com/books/v3/items?organization_id=${process.env.ZOHO_ORGANIZATION_ID}`, {
            method: 'POST',
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: product.name,
                rate: product.price,
                description: product.description || "Sản phẩm đồng bộ từ GoCart Plus",
                product_type: "goods"
            })
        });

        const zohoData = await zohoRes.json();

        if (zohoRes.ok && zohoData.code === 0) {
            // 🎉 TẠO TRÊN ZOHO BOOKS THÀNH CÔNG ➔ BÂY GIỜ MỚI UPDATE DATABASE LOCAL
            const updatedProduct = await prisma.product.update({
                where: { id: productId },
                data: {
                    status: "APPROVED" // Cập nhật trạng thái thành APPROVED thật sự qua luồng code
                }
            });

            console.log(`✓ Sản phẩm [${product.name}] đã được duyệt và đồng bộ lên Zoho Books!`);
            return NextResponse.json({ success: true, product: updatedProduct, zohoData });
        } else {
            console.error("❌ Zoho Books từ chối tạo mặt hàng:", zohoData);
            return NextResponse.json({ error: "Zoho Books từ chối đồng bộ", details: zohoData }, { status: 400 });
        }

    } catch (error) {
        console.error("Lỗi API duyệt sản phẩm:", error);
        return NextResponse.json({ error: "Lỗi hệ thống nội bộ" }, { status: 500 });
    }
}