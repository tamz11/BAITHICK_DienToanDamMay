'use client'
import { StarIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const ProductCard = ({ product }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    // 1. Chốt chặn an toàn cho Rating (Tránh sập trang nếu rỗng)
    const ratingArray = product.rating || [];
    const rating = ratingArray.length > 0 
        ? Math.round(ratingArray.reduce((acc, curr) => acc + curr.rating, 0) / ratingArray.length) 
        : 0;

    // ➔ 2. XỬ LÝ ẢNH SIÊU THÔNG MINH: Cân hết mọi loại dữ liệu (Object Next.js, String Base64, Array)
    let imageSrc = '/placeholder.png'; // Ảnh dự phòng nếu sản phẩm hoàn toàn không có ảnh

    if (product.images) {
        // Lấy phần tử đầu tiên nếu trường images là một mảng, nếu không thì lấy chính nó
        const rawImage = Array.isArray(product.images) ? product.images[0] : product.images;

        if (rawImage) {
            // Trường hợp A: Ảnh mẫu là Object do Next.js Static Import sinh ra (Ép lấy thuộc tính .src)
            if (typeof rawImage === 'object' && rawImage.src) {
                imageSrc = rawImage.src;
            } 
            // Trường hợp B: Ảnh thật hoặc link ảnh dạng chuỗi văn bản (String Base64 hoặc URL string)
            else if (typeof rawImage === 'string') {
                imageSrc = rawImage;
            }
        }
    }

    return (
        <Link href={`/product/${product.id}`} className='group max-xl:mx-auto'>
            <div className='bg-[#F5F5F5] h-40 sm:w-60 sm:h-68 rounded-lg flex items-center justify-center overflow-hidden'>
                <img 
                    className='max-h-30 sm:max-h-40 w-auto group-hover:scale-115 transition duration-300 object-contain' 
                    src={imageSrc} 
                    alt={product.name} 
                />
            </div>
            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60'>
                <div>
                    <p className="font-medium line-clamp-1">{product.name}</p>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                        ))}
                    </div>
                </div>
                <p className="font-bold">{currency}{product.price}</p>
            </div>
        </Link>
    )
}

export default ProductCard