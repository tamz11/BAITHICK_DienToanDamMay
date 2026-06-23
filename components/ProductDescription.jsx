'use client'
import { ArrowRight, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const ProductDescription = ({ product }) => {
    const [selectedTab, setSelectedTab] = useState('Description')
    const ratingArray = product?.rating || [];

    const getSafeImageUrl = (src) => {
        if (!src) return '/favicon.ico'
        if (typeof src !== 'string') return '/favicon.ico'
        const trimmed = src.trim()
        if (!trimmed || trimmed === 'null') return '/favicon.ico'
        return trimmed
    }

    return (
        <div className="my-18 text-sm text-slate-600">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
                {['Description', 'Reviews'].map((tab, idx) => (
                    <button 
                        className={`${tab === selectedTab ? 'border-b-[1.5px] font-semibold' : 'text-slate-400'} px-3 py-2 font-medium`} 
                        key={idx} 
                        onClick={() => setSelectedTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Description */}
            {selectedTab === "Description" && (
                <p className="max-w-xl leading-relaxed text-slate-600">
                    {product?.description || "Chưa có mô tả chi tiết cho sản phẩm này từ người bán."}
                </p>
            )}

            {/* Reviews */}
            {selectedTab === "Reviews" && (
                <div className="flex flex-col gap-3 mt-14">
                    {ratingArray.length === 0 ? (
                        <p className="text-slate-400 font-medium italic py-4">Sản phẩm này chưa có lượt đánh giá nào.</p>
                    ) : (
                        ratingArray.map((item, index) => (
                            <div key={index} className="flex gap-5 mb-10">
                                <Image 
                                    src={getSafeImageUrl(item?.user?.image)} 
                                    alt={item?.user?.name || 'User avatar'} 
                                    className="size-10 rounded-full object-cover" 
                                    width={100} 
                                    height={100} 
                                />
                                <div>
                                    {/* 🌟 ĐÃ FIX: Khối hiển thị sao bảo vệ bằng Optional Chaining và đổi tên biến tránh trùng lặp */}
                                    <div className="flex items-center mb-1">
                                        {Array(5).fill('').map((_, starIndex) => (
                                            <StarIcon 
                                                key={starIndex} 
                                                size={18} 
                                                className='text-transparent mt-0.5' 
                                                fill={item?.rating >= starIndex + 1 ? "#00C950" : "#D1D5DB"} 
                                            />
                                        ))}
                                    </div>
                                    
                                    {/* 🌟 ĐÃ FIX: Nội dung nhận xét an toàn */}
                                    <p className="text-sm max-w-lg my-2 text-slate-700">{item?.review || "Không có nội dung nhận xét"}</p>
                                    
                                    {/* 🌟 ĐÃ FIX: Tên người dùng an toàn */}
                                    <p className="font-semibold text-slate-800 text-xs">{item?.user?.name || "Người dùng ẩn danh"}</p>
                                    
                                    {/* 🌟 ĐÃ FIX: Ngày tháng an toàn chuẩn định dạng Việt Nam */}
                                    <p className="mt-1 text-[11px] text-slate-400 font-light">
                                        {item?.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ""}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Store Page */}
            <div className="flex gap-3 mt-14">
                <Image 
                    src={getSafeImageUrl(product?.store?.logo)} 
                    alt={product?.store?.name || 'Store logo'} 
                    className="size-11 rounded-full ring ring-slate-400 object-cover" 
                    width={100} 
                    height={100} 
                />
                <div>
                    <p className="font-medium text-slate-600">Product by {product?.store?.name || "Happy Shop"}</p>
                    <Link href={`/shop/${product?.store?.username}`} className="flex items-center gap-1.5 text-green-500"> 
                        view store <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ProductDescription