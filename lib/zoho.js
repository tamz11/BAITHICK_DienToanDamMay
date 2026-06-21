/**
 * Helper để tích hợp với Zoho Projects API
 * Luồng: Seller đăng sản phẩm -> Tạo Task trên Zoho Projects -> Staff xem Task để duyệt
 */

export async function createZohoTask(productName, sellerName, productUrl, productDescription, price, images) {
    try {
        const clientId = process.env.ZOHO_CLIENT_ID;
        const clientSecret = process.env.ZOHO_CLIENT_SECRET;
        const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
        const portalId = process.env.ZOHO_PORTAL_ID;
        const projectId = process.env.ZOHO_PROJECT_ID;

        // 1. Lấy Access Token mới từ Refresh Token
        const tokenUrl = `https://accounts.zoho.com/oauth/v2/token?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`;

        const tokenRes = await fetch(tokenUrl, { method: 'POST' });
        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
            console.error("Zoho Auth Error:", tokenData);
            return;
        }

        const accessToken = tokenData.access_token;

        // 2. Gọi API Zoho Projects để tạo Task
        const taskEndpoint = `https://projectsapi.zoho.com/restapi/portal/${portalId}/projects/${projectId}/tasks/`;

        const formData = new URLSearchParams();
        formData.append('name', `[DUYỆT SẢN PHẨM] ${productName}`);

        // Xử lý hiển thị ảnh (nếu là mảng JSON thì lấy cái đầu tiên hoặc liệt kê)
        let displayImages = "Không có ảnh.";
        if (images) {
            try {
                if (images.startsWith('[')) {
                    const imgArray = JSON.parse(images);
                    displayImages = imgArray.join("\n");
                } else {
                    displayImages = images;
                }
            } catch (e) {
                displayImages = images;
            }
        }

        // Cấu hình nội dung hiển thị bao gồm Giá và Ảnh
        const taskContent = `
Sản phẩm: ${productName}
Người bán: ${sellerName}
Giá bán: ${process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'}${price}

MÔ TẢ SẢN PHẨM:
${productDescription || "Không có mô tả chi tiết."}

HÌNH ẢNH SẢN PHẨM:
${displayImages}

------------------------------------------
Link chi tiết để duyệt: ${productUrl}
Vui lòng kiểm tra thông tin và hình ảnh trước khi chuyển trạng thái APPROVED.
        `.trim();

        formData.append('description', taskContent);
        formData.append('priority', 'Medium');

        const res = await fetch(taskEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        const result = await res.json();
        return result;
    } catch (error) {
        console.error("Lỗi tích hợp Zoho Projects:", error);
    }
}
