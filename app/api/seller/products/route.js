import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import prisma from '@/lib/prisma';

// 🌟 Import chuẩn cả 2 hàm xử lý từ trợ lý zoho.js
import { createZohoTask, createZohoItem } from "@/lib/zoho";

import { spacesClient } from "@/lib/spacesClient";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = 'force-dynamic';

// ==========================================
// 🌌 HÀM UTILS: UPLOAD ẢNH LÊN DIGITALOCEAN SPACES
// ==========================================
async function uploadBase64ToSpaces(base64Str) {
    if (!base64Str || !base64Str.startsWith("data:image")) return base64Str;
    try {
        const mimeType = base64Str.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
        const extension = mimeType.split('/')[1] || 'png';
        const base64Data = base64Str.replace(/^data:image\/\w+;base64,/, "");
        const fileBuffer = Buffer.from(base64Data, 'base64');
        const randomId = Math.random().toString(36).substring(2, 7);
        const fileName = `products/img-${Date.now()}-${randomId}.${extension}`;

        const uploadCommand = new PutObjectCommand({
            Bucket: process.env.DO_SPACES_BUCKET,
            Key: fileName,
            Body: fileBuffer,
            ACL: "public-read",
            ContentType: mimeType,
        });
        await spacesClient.send(uploadCommand);
        return `${process.env.DO_SPACES_BASE_URL}/${fileName}`;
    } catch (err) {
        console.error("Lỗi upload ảnh:", err);
        return "/placeholder.png";
    }
}

// ==========================================
// 📥 1. API LẤY DANH SÁCH SẢN PHẨM (GET)
// ==========================================
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "STORE_OWNER") {
            return NextResponse.json({ error: "Từ chối quyền truy cập" }, { status: 403 });
        }
        const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
        if (!store) return NextResponse.json({ error: "Cửa hàng chưa thiết lập" }, { status: 404 });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const products = await prisma.product.findMany({
            where: { storeId: store.id, isDeleted: false },
            include: { 
                rating: true,
                orderItems: {
                    where: { order: { createdAt: { gte: thirtyDaysAgo }, status: "DELIVERED" } }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        const productsWithRevenue = products.map(product => {
            const revenue30Days = product.orderItems?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
            const { orderItems, ...productData } = product;
            return { ...productData, revenue30Days };
        });

        return NextResponse.json(productsWithRevenue);
    } catch (error) {
        return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
    }
}

// ==========================================
// 🚀 2. API ĐĂNG SẢN PHẨM MỚI (POST)
// ==========================================
export async function POST(req) {
    try {
        // 1. Xác thực Session và Quyền hạn
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "STORE_OWNER") {
            return NextResponse.json({ error: "Từ chối quyền truy cập" }, { status: 403 });
        }

        // 2. Xác thực sự tồn tại của Cửa hàng
        const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
        if (!store) return NextResponse.json({ error: "Thiếu bản ghi Store" }, { status: 404 });

        // 🛡️ 3. Kiểm tra trạng thái duyệt của Cửa hàng (Chặn lỗi nghiệp vụ)
        if (store.status?.toUpperCase() !== "APPROVED") {
            return NextResponse.json(
                { error: "Cửa hàng của bạn đang chờ Admin phê duyệt. Vui lòng quay lại sau khi được kích hoạt!" }, 
                { status: 403 }
            );
        }

        // 4. Đọc dữ liệu từ Frontend gửi lên
        const body = await req.json();
        const { name, description, mrp, price, category, stock, images } = body;

        // 5. Xử lý upload ảnh Base64 lên DigitalOcean Spaces
        let finalImagesValue = "/placeholder.png";
        if (images) {
            if (Array.isArray(images)) {
                const uploadedUrls = await Promise.all(images.map(img => uploadBase64ToSpaces(img)));
                finalImagesValue = JSON.stringify(uploadedUrls);
            } else if (typeof images === 'string') {
                finalImagesValue = await uploadBase64ToSpaces(images);
            }
        }

        // 6. Lưu dữ liệu Sản phẩm vào MySQL local dưới trạng thái PENDING
        const newProduct = await prisma.product.create({
            data: {
                name,
                description: description || "",
                mrp: parseFloat(mrp) || parseFloat(price),
                price: parseFloat(price),
                images: finalImagesValue, 
                category: category || "Chưa phân loại",
                stock: parseInt(stock) || 0,
                inStock: parseInt(stock) > 0,
                storeId: store.id,
                status: "PENDING"
            }
        });

        const productUrl = `${process.env.NEXTAUTH_URL}/products/${newProduct.id}`;

        // 🌟 TÍCH HỢP ZOHO PROJECTS: Tạo phiếu kiểm định Task cho nhân viên Staff duyệt
        createZohoTask(
            newProduct.name,
            store.name,
            productUrl,
            newProduct.description,
            newProduct.price,
            newProduct.images
        ).catch(err => console.error("Lỗi ngầm luồng Projects:", err));

        // 🌟 TÍCH HỢP ZOHO BOOKS: Đẩy trực tiếp mặt hàng lên kho kế toán của Hải
        createZohoItem(
            newProduct.name,
            newProduct.price,
            newProduct.description
        ).then(zohoResult => {
            if (zohoResult && zohoResult.code === 0) {
                console.log(`✓ [Zoho Books] Đồng bộ thành công mặt hàng: ${newProduct.name}`);
            } else {
                console.error("⚠️ [Zoho Books] Từ chối tạo Item:", zohoResult);
            }
        }).catch(err => {
            console.error("❌ [Zoho Books] Luồng lỗi kết nối API:", err);
        });

        // 7. Phản hồi thành công về cho Seller
        return NextResponse.json(newProduct, { status: 201 });

    } catch (error) {
        console.error("Lỗi POST product:", error);
        return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
    }
}