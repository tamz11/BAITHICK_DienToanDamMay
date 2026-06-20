'use client'
import { ArrowRight, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const ProductDescription = ({ product }) => {

    const [selectedTab, setSelectedTab] = useState('Description')

<<<<<<< HEAD
    const getSafeImageUrl = (src) => {
        if (!src) return '/favicon.ico'
        if (typeof src !== 'string') return '/favicon.ico'
        const trimmed = src.trim()
        if (!trimmed || trimmed === 'null') return '/favicon.ico'
        return trimmed
    }

=======
>>>>>>> 5e6f11fbe23afe2ef2180f979c7d843b9b483f09
    return (
        <div className="my-18 text-sm text-slate-600">

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
                {['Description', 'Reviews'].map((tab, index) => (
                    <button className={`${tab === selectedTab ? 'border-b-[1.5px] font-semibold' : 'text-slate-400'} px-3 py-2 font-medium`} key={index} onClick={() => setSelectedTab(tab)}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Description */}
            {selectedTab === "Description" && (
                <p className="max-w-xl">{product.description}</p>
            )}

            {/* Reviews */}
            {selectedTab === "Reviews" && (
                <div className="flex flex-col gap-3 mt-14">
                    {product.rating.map((item,index) => (
                        <div key={index} className="flex gap-5 mb-10">
<<<<<<< HEAD
                            <Image src={getSafeImageUrl(item.user.image)} alt={item.user.name || 'User avatar'} className="size-10 rounded-full" width={100} height={100} />
=======
                            <Image src={item.user.image} alt="" className="size-10 rounded-full" width={100} height={100} />
>>>>>>> 5e6f11fbe23afe2ef2180f979c7d843b9b483f09
                            <div>
                                <div className="flex items-center" >
                                    {Array(5).fill('').map((_, index) => (
                                        <StarIcon key={index} size={18} className='text-transparent mt-0.5' fill={item.rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
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

            {/* Store Page */}
            <div className="flex gap-3 mt-14">
<<<<<<< HEAD
                <Image src={getSafeImageUrl(product.store.logo)} alt={product.store.name || 'Store logo'} className="size-11 rounded-full ring ring-slate-400" width={100} height={100} />
=======
                <Image src={product.store.logo} alt="" className="size-11 rounded-full ring ring-slate-400" width={100} height={100} />
>>>>>>> 5e6f11fbe23afe2ef2180f979c7d843b9b483f09
                <div>
                    <p className="font-medium text-slate-600">Product by {product.store.name}</p>
                    <Link href={`/shop/${product.store.username}`} className="flex items-center gap-1.5 text-green-500"> view store <ArrowRight size={14} /></Link>
                </div>
            </div>
        </div>
    )
}

export default ProductDescription