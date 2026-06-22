/**
 * Helper để tích hợp với Zoho Projects API
 */

async function getAccessToken() {
    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;
    const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
    const tokenUrl = `https://accounts.zoho.com/oauth/v2/token?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`;

    const tokenRes = await fetch(tokenUrl, { method: 'POST' });
    const tokenData = await tokenRes.json();
    return tokenData.access_token;
}

// 1. Task cho Seller đăng sản phẩm
export async function createZohoTask(productName, sellerName, productUrl, productDescription, price, images) {
    try {
        const accessToken = await getAccessToken();
        if (!accessToken) return;

        const portalId = process.env.ZOHO_PORTAL_ID;
        const projectId = process.env.ZOHO_PROJECT_ID;
        const taskEndpoint = `https://projectsapi.zoho.com/restapi/portal/${portalId}/projects/${projectId}/tasks/`;

        let displayImages = images?.startsWith('[') ? JSON.parse(images).join("\n") : images;

        const taskContent = `
Sản phẩm: ${productName}
Người bán: ${sellerName}
Giá bán: ${process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'}${price}

MÔ TẢ:
${productDescription || "Không có mô tả."}

HÌNH ẢNH:
${displayImages}

Link duyệt: ${productUrl}
        `.trim();

        const formData = new URLSearchParams();
        formData.append('name', `[DUYỆT SP] ${productName}`);
        formData.append('description', taskContent);
        formData.append('priority', 'Medium');

        await fetch(taskEndpoint, {
            method: 'POST',
            headers: { 'Authorization': `Zoho-oauthtoken ${accessToken}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });
    } catch (error) {
        console.error("Zoho Product Task Error:", error);
    }
}

// 🌟 2. Task cho Khách hàng đặt đơn (MỚI)
export async function createZohoOrderTask(orderData) {
    try {
        const accessToken = await getAccessToken();
        if (!accessToken) return;

        const portalId = process.env.ZOHO_PORTAL_ID;
        const projectId = process.env.ZOHO_PROJECT_ID;
        const taskEndpoint = `https://projectsapi.zoho.com/restapi/portal/${portalId}/projects/${projectId}/tasks/`;

        const { customerName, phone, address, items, total, orderId } = orderData;

        const productList = items.map(item => `- ${item.name} (x${item.quantity})`).join('\n');

        const taskContent = `
THÔNG TIN KHÁCH HÀNG:
- Khách hàng: ${customerName}
- Số điện thoại: ${phone}
- Địa chỉ giao hàng: ${address}

DANH SÁCH SẢN PHẨM ĐÃ ĐẶT:
${productList}

TỔNG TIỀN: ${process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'}${total}
------------------------------------------
Mã đơn hàng: #${orderId.slice(-6).toUpperCase()}
Vui lòng kiểm tra kho và cập nhật trạng thái PROCESSING cho đơn hàng này.
        `.trim();

        const formData = new URLSearchParams();
        formData.append('name', `[ĐƠN HÀNG MỚI] #${orderId.slice(-6).toUpperCase()} - ${customerName}`);
        formData.append('description', taskContent);
        formData.append('priority', 'High');

        await fetch(taskEndpoint, {
            method: 'POST',
            headers: { 'Authorization': `Zoho-oauthtoken ${accessToken}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });
    } catch (error) {
        console.error("Zoho Order Task Error:", error);
    }
}
