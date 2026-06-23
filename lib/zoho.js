/**
 * 🚀 PHẦN 1: ZOHO PROJECTS API (Giữ nguyên gốc 100%)
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

/**
 * 💰 PHẦN 2: ZOHO BOOKS API 
 * Luồng: Tạo trực tiếp mặt hàng lên kho kế toán đám mây Zoho Books
 */
async function getZohoBooksToken() {
    try {
        const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                refresh_token: process.env.ZOHO_BOOKS_REFRESH_TOKEN, // Gọi bộ khóa biệt lập
                client_id: process.env.ZOHO_BOOKS_CLIENT_ID,
                client_secret: process.env.ZOHO_BOOKS_CLIENT_SECRET,
                grant_type: 'refresh_token',
            }),
        });
        const data = await response.json();
        if (!data.access_token) {
            console.error("❌ [Zoho Accounts báo lỗi thật]:", data);
        }
        return data.access_token;
    } catch (error) {
        console.error("❌ [Zoho Books] Lỗi đổi token:", error);
        return null;
    }
}

export async function createZohoItem(name, price, description) {
    try {
        const accessToken = await getZohoBooksToken();
        if (!accessToken) return null;

        const response = await fetch(`https://www.zohoapis.com/books/v3/items?organization_id=${process.env.ZOHO_ORGANIZATION_ID}`, {
            method: 'POST',
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                rate: parseFloat(price),
                description: description || "Sản phẩm đồng bộ tự động từ GoCart Plus",
                product_type: "goods"
            })
        });

        return await response.json();
    } catch (error) {
        console.error("❌ [Zoho Books] Lỗi gọi API tạo Item:", error);
        return null;
    }
}

/**
 * 🎯 PHẦN 3: ZOHO CRM API 
 * Luồng: Khi có User mới đăng ký hoặc Seller mở Shop -> Đẩy thông tin lên CRM để chăm sóc
 */

// Hàm đổi Access Token riêng cho phân hệ CRM
async function getZohoCRMToken() {
    try {
        const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                refresh_token: process.env.ZOHO_CRM_REFRESH_TOKEN,
                client_id: process.env.ZOHO_CRM_CLIENT_ID,
                client_secret: process.env.ZOHO_CRM_CLIENT_SECRET,
                grant_type: 'refresh_token',
            }),
        });
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("❌ [Zoho CRM] Lỗi lấy Access Token:", error);
        return null;
    }
}

// Hàm tạo một Lead (Khách hàng/Đối tác tiềm năng) trên CRM
export async function createZohoLead(lastName, firstName, email, phone, companyName) {
    try {
        const accessToken = await getZohoCRMToken();
        if (!accessToken) return null;

        const response = await fetch('https://www.zohoapis.com/crm/v3/Leads', {
            method: 'POST',
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: [
                    {
                        "Last_Name": lastName,
                        "First_Name": firstName,
                        "Email": email,
                        "Phone": phone || "",
                        "Company": companyName || "Khách hàng vãng lai",
                        "Lead_Source": "Website GoCart Plus"
                    }
                ]
            })
        });

        return await response.json();
    } catch (error) {
        console.error("❌ [Zoho CRM] Lỗi gọi API tạo Lead:", error);
        return null;
    }
}