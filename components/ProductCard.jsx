'use client'
import { StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ProductCard = ({ product }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    // Khởi tạo giá trị mặc định cho rating để tránh lỗi crash
    const ratingList = product.rating || []
    const rating = ratingList.length > 0
        ? Math.round(ratingList.reduce((acc, curr) => acc + curr.rating, 0) / ratingList.length)
        : 0;

    // Xử lý hình ảnh từ database (hỗ trợ cả mảng và chuỗi JSON)
    let displayImage = ""
    try {
        if (Array.isArray(product.images)) {
            displayImage = product.images[0]
        } else if (typeof product.images === 'string') {
            if (product.images.startsWith('[') && product.images.endsWith(']')) {
                const parsed = JSON.parse(product.images)
                displayImage = parsed[0]
            } else {
                displayImage = product.images
            }
        }
    } catch (e) {
        displayImage = ""
    }

    return (
        <Link href={`/product/${product.id}`} className=' group max-xl:mx-auto'>
            <div className='bg-[#F5F5F5] h-40  sm:w-60 sm:h-68 rounded-lg flex items-center justify-center overflow-hidden'>
                {displayImage ? (
                    <img className='max-h-30 sm:max-h-40 w-auto group-hover:scale-115 transition duration-300 object-contain' src={displayImage} alt={product.name} />
                ) : (
                    <div className="text-slate-300 text-xs">No image</div>
                )}
            </div>
            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60'>
                <div className="flex-1 min-w-0">
                    <p className="truncate">{product.name}</p>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                        ))}
                    </div>
                </div>
                <p className="font-bold">{currency}{product.price.toLocaleString()}</p>
            </div>
        </Link>
    )
}

export default ProductCard
