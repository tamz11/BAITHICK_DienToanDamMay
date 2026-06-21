import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import prisma from '@/lib/prisma';
import { createZohoTask } from "@/lib/zoho";

import { spacesClient } from "@/lib/spacesClient";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = 'force-dynamic';

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

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "STORE_OWNER") {
            return NextResponse.json({ error: "Từ chối quyền truy cập" }, { status: 403 });
        }

        const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
        if (!store) return NextResponse.json({ error: "Thiếu bản ghi Store" }, { status: 404 });

        const body = await req.json();
        const { name, description, mrp, price, category, stock, images } = body;

        let finalImagesValue = "/placeholder.png";
        if (images) {
            if (Array.isArray(images)) {
                const uploadedUrls = await Promise.all(images.map(img => uploadBase64ToSpaces(img)));
                finalImagesValue = JSON.stringify(uploadedUrls);
            } else if (typeof images === 'string') {
                finalImagesValue = await uploadBase64ToSpaces(images);
            }
        }

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

        // 🌟 TÍCH HỢP ZOHO PROJECTS: Tạo Task kèm đầy đủ thông tin: Tên, Người bán, Link, Mô tả, Giá, Ảnh
        const productUrl = `${process.env.NEXTAUTH_URL}/products/${newProduct.id}`;

        createZohoTask(
            newProduct.name,
            store.name,
            productUrl,
            newProduct.description,
            newProduct.price,
            newProduct.images
        ).catch(console.error);

        return NextResponse.json(newProduct, { status: 201 });

    } catch (error) {
        console.error("Lỗi POST product:", error);
        return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
    }
}
