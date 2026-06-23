import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import prisma from '@/lib/prisma';
import { spacesClient } from "@/lib/spacesClient"; 
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createZohoLead } from "@/lib/zoho";
export const dynamic = 'force-dynamic';

// ==========================================
// 📥 1. LẤY CHI TIẾT THÔNG TIN CỬA HÀNG (GET)
// ==========================================
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "STORE_OWNER") {
            return NextResponse.json({ error: "Từ chối quyền truy cập" }, { status: 403 });
        }

        const store = await prisma.store.findUnique({
            where: { userId: session.user.id }
        });

        if (!store) {
            return NextResponse.json({ error: "Chưa thiết lập hồ sơ cửa hàng" }, { status: 404 });
        }

        return NextResponse.json(store);
    } catch (error) {
        console.error("Lỗi lấy hồ sơ người bán:", error);
        return NextResponse.json({ error: "Lỗi máy chủ khi tải hồ sơ" }, { status: 500 });
    }
}

// ==========================================
// 💾 2. CẬP NHẬT THÔNG TIN NGƯỜI BÁN (PUT)
// ==========================================
export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "STORE_OWNER") {
            return NextResponse.json({ error: "Từ chối quyền truy cập" }, { status: 403 });
        }

        const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
        if (!store) {
            return NextResponse.json({ error: "Cửa hàng không tồn tại" }, { status: 404 });
        }

        const body = await req.json();
        const { name, description, phone, email, address, logoBase64 } = body;

        if (!name) {
            return NextResponse.json({ error: "Tên cửa hàng không được bỏ trống" }, { status: 400 });
        }

        let finalLogoUrl = store.logo || ""; 

        if (logoBase64 && logoBase64.startsWith("data:image")) {
            const mimeType = logoBase64.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0]; 
            const extension = mimeType.split('/')[1] || 'png';
            const base64Data = logoBase64.replace(/^data:image\/\w+;base64,/, "");
            const fileBuffer = Buffer.from(base64Data, 'base64');
            
            const fileName = `stores/logo-${store.id}-${Date.now()}.${extension}`;

            const uploadCommand = new PutObjectCommand({
                Bucket: process.env.DO_SPACES_BUCKET,
                Key: fileName,
                Body: fileBuffer,
                ACL: "public-read",
                ContentType: mimeType,
            });

            await spacesClient.send(uploadCommand);
            finalLogoUrl = `${process.env.DO_SPACES_BASE_URL}/${fileName}`;
        }

        // 🌟 TIẾN HÀNH CẬP NHẬT DATABASE LOCAL
        const updatedStore = await prisma.store.update({
            where: { id: store.id },
            data: {
                name: name,
                description: description || "",
                contact: phone || "", 
                email: email || "",
                address: address || "",
                logo: finalLogoUrl
            }
        });

        // =========================================================
        // 🎯 TÍCH HỢP ZOHO CRM: Chạy ngầm đồng bộ hóa đối tác
        // =========================================================
        // 🛠️ Tối ưu: Tự động tách Họ và Tên từ session user cho chuẩn cấu trúc CRM
        const fullName = session.user.name || "Seller Owner";
        const nameParts = fullName.trim().split(" ");
        const lastName = nameParts.pop(); 
        const firstName = nameParts.join(" ") || "Store"; 

        createZohoLead(
            lastName,
            firstName,
            email || session.user.email, // Ưu tiên email điền từ form, nếu trống lấy email session
            phone || "",                 // Số điện thoại của Shop
            name                         // 🛠️ Đã sửa: Truyền đúng biến 'name' đại diện cho Tên Cửa Hàng (Company)
        ).then(crmRes => {
            if (crmRes && !crmRes.error) {
                console.log(`✓ [Zoho CRM] Đã đồng bộ Đối tác Seller [${name}] lên hệ thống chăm sóc thành công!`);
            } else {
                console.error("⚠️ [Zoho CRM] Bị từ chối khởi tạo Lead:", crmRes);
            }
        }).catch(err => {
            console.error("❌ [Zoho CRM] Gặp sự cố kết nối luồng ngầm:", err);
        });

        return NextResponse.json({ success: true, data: updatedStore });
    } catch (error) {
        console.error("Lỗi cập nhật hồ sơ người bán:", error);
        // 🛠️ Đã sửa: Thay thế biến data?.error không tồn tại thành error?.message để tránh crash server
        return NextResponse.json({ error: error?.message || "Lỗi hệ thống khi lưu thông tin" }, { status: 500 });
    }
}