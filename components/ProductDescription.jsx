'use client'
import { ArrowRight, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const ProductDescription = ({ product }) => {
    const [selectedTab, setSelectedTab] = useState('Description')
    const ratingArray = product?.rating || []

    const getSafeImageUrl = (src) => {
        if (!src) return '/favicon.ico'
        if (typeof src !== 'string') return '/favicon.ico'
        const trimmed = src.trim()
        if (!trimmed || trimmed === 'null') return '/favicon.ico'
        return trimmed
    }

    return (
        <div className="my-18 text-sm text-slate-600">
            <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
                {['Description', 'Reviews'].map((tab, index) => (
                    <button className={`${tab === selectedTab ? 'border-b-[1.5px] font-semibold' : 'text-slate-400'} px-3 py-2 font-medium`} key={index} onClick={() => setSelectedTab(tab)}>
                        {tab}
                    </button>
                ))}
            </div>

            {selectedTab === "Description" && (
                <p className="max-w-xl leading-relaxed text-slate-600">{product?.description || "Chưa có mô tả chi tiết cho sản phẩm này từ người bán."}</p>
            )}

            {selectedTab === "Reviews" && (
                <div className="flex flex-col gap-3 mt-14">
                    {ratingArray.length === 0 ? (
                        <p className="text-slate-400 font-medium italic py-4">Sản phẩm này chưa có lượt đánh giá nào.</p>
                    ) : ratingArray.map((item, index) => (
                        <div key={index} className="flex gap-5 mb-10">
                            <Image src={getSafeImageUrl(item?.user?.image)} alt={item?.user?.name || 'User avatar'} className="size-10 rounded-full" width={100} height={100} />
                            <div>
                                <div className="flex items-center">
                                    {Array(5).fill('').map((_, i) => (
                                        <StarIcon key={i} size={18} className='text-transparent mt-0.5' fill={item.rating >= i + 1 ? "#00C950" : "#D1D5DB"} />
                                    ))}
                                </div>
                                <p className="text-sm max-w-lg my-4">{item.review}</p>
                                <p className="font-medium text-slate-800">{item.user.name}</p>
                                <p className="mt-3 font-light">{new Date(item.createdAt).toDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex gap-3 mt-14">
                <Image src={getSafeImageUrl(product?.store?.logo)} alt={product?.store?.name || 'Store logo'} className="size-11 rounded-full ring ring-slate-400" width={100} height={100} />
                <div>
                    <p className="font-medium text-slate-600">Product by {product?.store?.name || "Happy Shop"}</p>
                    <Link href={`/shop/${product?.store?.username}`} className="flex items-center gap-1.5 text-green-500"> view store <ArrowRight size={14} /></Link>
                </div>
            </div>
        </div>
    )
}

export default ProductDescription
