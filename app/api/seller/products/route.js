import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import prisma from '@/lib/prisma';

// 🌟 THÊM: Import công cụ kết nối Space và lệnh đẩy file lên Cloud
import { spacesClient } from "@/lib/spacesClient"; 
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = 'force-dynamic';

// ==========================================
// 🌟 HÀM PHỤ TRỢ: CHUYỂN BASE64 VÀ UPLOAD LÊN SPACE
// ==========================================
async function uploadBase64ToSpaces(base64Str) {
    // Nếu không phải chuỗi ảnh Base64 (ví dụ link sẵn), giữ nguyên đường dẫn
    if (!base64Str || !base64Str.startsWith("data:image")) return base64Str;

    try {
        // 1. Tách MimeType định dạng ảnh (png, jpeg) và lọc text dữ liệu thuần
        const mimeType = base64Str.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0]; // Ví dụ: image/png
        const extension = mimeType.split('/')[1] || 'png';
        const base64Data = base64Str.replace(/^data:image\/\w+;base64,/, "");
        
        // 2. Ép chuỗi văn bản Base64 thành định dạng file Buffer vật lý
        const fileBuffer = Buffer.from(base64Data, 'base64');
        
        // 3. Đặt tên file duy nhất kết hợp mã ngẫu nhiên để chống ghi đè ảnh trùng tên trên Cloud
        const randomId = Math.random().toString(36).substring(2, 7);
        const fileName = `products/img-${Date.now()}-${randomId}.${extension}`;

        // 4. Cấu hình lệnh nạp PutObject đẩy thẳng lên DigitalOcean
        const uploadCommand = new PutObjectCommand({
            Bucket: process.env.DO_SPACES_BUCKET, // Tên bucket: electriczone
            Key: fileName,                        // Thư mục và tên file trên Space
            Body: fileBuffer,                     // Dữ liệu file vật lý
            ACL: "public-read",                   // Cấp quyền Public công khai để khách xem được ảnh
            ContentType: mimeType,                // Định dạng hiển thị file ảnh
        });

        // Kích hoạt lệnh gửi dữ liệu lên mây Space
        await spacesClient.send(uploadCommand);

        // 5. Khâu và trả về đường link tuyệt đối cực kỳ ngắn gọn sạch đẹp
        return `${process.env.DO_SPACES_BASE_URL}/${fileName}`;
    } catch (err) {
        console.error("Lỗi nhỏ khi xử lý 1 file ảnh đưa lên Space:", err);
        return "/placeholder.png"; // Trả về ảnh dự phòng nếu file lỗi để hệ thống không bị crash
    }
}

// ==========================================
// 📥 LẤY DANH SÁCH SẢN PHẨM CỦA SHOP (GET) + TÍNH DOANH THU 30 NGÀY
// ==========================================
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "STORE_OWNER") {
            return NextResponse.json({ error: "Từ chối quyền truy cập" }, { status: 403 });
        }

        const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
        if (!store) {
            return NextResponse.json({ error: "Cửa hàng chưa được thiết lập" }, { status: 404 });
        }

        // 🌟 1. Thiết lập mốc thời gian lùi lại chính xác 30 ngày trước
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // 🌟 2. Truy vấn danh sách sản phẩm kèm theo các OrderItem hợp lệ
        const products = await prisma.product.findMany({
            where: { storeId: store.id, isDeleted: false },
            include: { 
                rating: true,
                orderItems: {
                    where: {
                        order: {
                            createdAt: { gte: thirtyDaysAgo },
                            status: "DELIVERED" // Chỉ tính toán trên các đơn hàng đã giao thành công
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        // 🌟 3. Tính toán cộng dồn doanh thu (Price * Quantity) cho từng món hàng
        const productsWithRevenue = products.map(product => {
            const revenue30Days = product.orderItems?.reduce((total, item) => {
                return total + (item.price * item.quantity);
            }, 0) || 0;

            // Bóc tách loại bỏ mảng orderItems thô để dữ liệu JSON trả về Frontend nhẹ và sạch hơn
            const { orderItems, ...productData } = product;

            return {
                ...productData,
                revenue30Days // Trả kèm thêm trường tổng số tiền bán được trong tháng
            };
        });

        return NextResponse.json(productsWithRevenue);
    } catch (error) {
        console.error("Lỗi nghiêm trọng tại GET products:", error);
        return NextResponse.json({ error: "Lỗi máy chủ nội bộ ngầm" }, { status: 500 });
    }
}

// ==========================================
// 📤 ĐĂNG SẢN PHẨM MỚI LÊN SPACE + DB (POST) + TRẠNG THÁI CHỜ DUYỆT
// ==========================================
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "STORE_OWNER") {
            return NextResponse.json({ error: "Từ chối quyền truy cập" }, { status: 403 });
        }

        const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
        if (!store) {
            return NextResponse.json({ 
                error: "Tài khoản test của bạn thiếu bản ghi Store. Vui lòng đăng ký tài khoản Seller mới để test!" 
            }, { status: 404 });
        }

        const body = await req.json();
        const { name, description, mrp, price, category, stock, images } = body;

        if (!name || !price || !stock) {
            return NextResponse.json({ error: "Vui lòng nhập đầy đủ Tên, Giá bán và Số lượng tồn kho" }, { status: 400 });
        }

        // XỬ LÝ LỌC VÀ ĐẨY ẢNH LÊN CLOUD ĐÁM MÂY
        let finalImagesValue = "/placeholder.png";

        if (images) {
            // Tình huống A: Nếu Frontend gửi lên một MẢNG nhiều ảnh
            if (Array.isArray(images)) {
                const uploadedUrls = await Promise.all(
                    images.map(async (img) => await uploadBase64ToSpaces(img))
                );
                finalImagesValue = JSON.stringify(uploadedUrls);
            } 
            // Tình huống B: Nếu Frontend chỉ gửi lên độc nhất một chuỗi ảnh single
            else if (typeof images === 'string') {
                finalImagesValue = await uploadBase64ToSpaces(images);
            }
        }

        // Tạo sản phẩm thực tế vào Database MySQL
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
                
                // 🌟 ÉP BUỘC CHỐT CHẶN: Sản phẩm mới luôn mặc định ở trạng thái Chờ Duyệt
                status: "PENDING" 
            }
        });

        return NextResponse.json(newProduct, { status: 201 });

    } catch (error) {
        console.error("Lỗi đăng sản phẩm tại API Route:", error);
        return NextResponse.json({ error: "Lỗi hệ thống không thể tạo sản phẩm" }, { status: 500 });
    }
}