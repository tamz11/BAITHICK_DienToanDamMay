'use client'
import { StarIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const ProductCard = ({ product }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    // 1. Chốt chặn an toàn cho Rating (Tránh sập trang nếu rỗng)
    const ratingList = product?.rating || []
    const rating = ratingList.length > 0
        ? Math.round(ratingList.reduce((acc, curr) => acc + curr.rating, 0) / ratingList.length)
        : 0;

    // 🌟 Đcore GỘP THÔNG MINH: Hàm xử lý ảnh đa năng bốc tách chuỗi Base64, Static Import và chuỗi Array JSON
    const getImageUrl = (img) => {
        if (!img) return "/placeholder.png"

        // Trường hợp 1: img là chuỗi văn bản (URL String, Base64 hoặc chuỗi mảng mã hóa)
        if (typeof img === 'string') {
            if (img.trim() === "" || img === "null") return "/placeholder.png"
            try {
                // Đề phòng dữ liệu bị đóng gói dạng chuỗi mảng JSON từ Database
                if (img.startsWith('[') && img.endsWith(']')) {
                    const parsed = JSON.parse(img)
                    const first = parsed[0]
                    return (typeof first === 'object' ? first.src : first) || "/placeholder.png"
                }
            } catch (e) {}
            return img // Trả về link string hoặc chuỗi Base64 trực tiếp
        }

        // Trường hợp 2: img là Static Import (đối tượng tài nguyên ảnh của Next.js)
        return img.src || img
    }

    // Lấy phần tử ảnh đầu tiên trong mảng hoặc chuỗi
    const firstImage = Array.isArray(product?.images) ? product.images[0] : product?.images
    const displayImage = getImageUrl(firstImage)

    return (
        <Link href={`/product/${product?.id}`} className='group max-xl:mx-auto block'>
            {/* Khung chứa ảnh - Giữ nguyên cải tiến p-2 và max-h-full của main để ảnh cân đối */}
            <div className='bg-[#F5F5F5] h-40 sm:w-60 sm:h-68 rounded-lg flex items-center justify-center overflow-hidden p-2 border border-slate-50/50'>
                <img
                    className='max-h-full max-w-full group-hover:scale-110 transition duration-300 object-contain'
                    src={displayImage}
                    alt={product?.name || "Product"}
                    // Chốt chặn cuối cùng: Nếu ảnh hoàn toàn lỗi đường truyền, ép nạp placeholder
                    onError={(e) => { e.target.src = "/placeholder.png" }} 
                />
            </div>
            
            {/* Khung thông tin Tên, Sao và Giá bán */}
            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60'>
                {/* Giữ lại khối bao flex-1 min-w-0 của main để chữ không bị đẩy vỡ khung giá */}
                <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{product?.name}</p>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                        ))}
                    </div>
                </div>
                {/* Giữ phong cách hiển thị giá tiền phân tách hàng nghìn cực đẹp của main */}
                <p className="font-bold text-green-600 shrink-0">
                    {currency}{Number(product?.price || 0).toLocaleString()}
                </p>
            </div>
        </Link>
    )
}

export default ProductCard