'use client'
import { StarIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const ProductCard = ({ product }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const ratingList = product.rating || []
    const rating = ratingList.length > 0
        ? Math.round(ratingList.reduce((acc, curr) => acc + curr.rating, 0) / ratingList.length)
        : 0;

    // Hàm lấy URL ảnh an toàn hỗ trợ cả Static Import và URL String
    const getImageUrl = (img) => {
        if (!img) return "https://via.placeholder.com/500"

<<<<<<< HEAD
        if (typeof img === 'string') {
            const trimmed = img.trim()
            if (!trimmed || trimmed === "null") return "https://via.placeholder.com/500"
            try {
                if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                    const parsed = JSON.parse(trimmed)
                    const first = parsed[0]
                    const result = typeof first === 'object' ? first?.src : first
                    return result || "https://via.placeholder.com/500"
                }
            } catch (e) {}
            return trimmed
        }

        return img?.src || "https://via.placeholder.com/500"
=======
        // Trường hợp 1: img là chuỗi (URL hoặc JSON string từ DB)
        if (typeof img === 'string') {
            if (img.trim() === "" || img === "null") return "https://via.placeholder.com/500"
            try {
                if (img.startsWith('[') && img.endsWith(']')) {
                    const parsed = JSON.parse(img)
                    const first = parsed[0]
                    return (typeof first === 'object' ? first.src : first) || "https://via.placeholder.com/500"
                }
            } catch (e) {}
            return img
        }

        // Trường hợp 2: img là Static Import (đối tượng ảnh của Next.js)
        return img.src || img
>>>>>>> 5e6f11fbe23afe2ef2180f979c7d843b9b483f09
    }

    // Lấy ảnh đầu tiên
    const firstImage = Array.isArray(product.images) ? product.images[0] : product.images
    const displayImage = getImageUrl(firstImage)

    return (
        <Link href={`/product/${product.id}`} className='group max-xl:mx-auto block'>
            <div className='bg-[#F5F5F5] h-40 sm:w-60 sm:h-68 rounded-lg flex items-center justify-center overflow-hidden p-2'>
                <img
                    className='max-h-full max-w-full group-hover:scale-110 transition duration-300 object-contain'
                    src={displayImage}
                    alt={product.name}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/500" }}
                />
            </div>
            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60'>
                <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{product.name}</p>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                        ))}
                    </div>
                </div>
                <p className="font-bold text-green-600">{currency}{Number(product.price).toLocaleString()}</p>
            </div>
        </Link>
    )
}

export default ProductCard
