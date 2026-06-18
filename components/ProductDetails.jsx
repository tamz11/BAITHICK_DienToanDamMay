'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";

const ProductDetails = ({ product }) => {
    const productId = product.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

    const cart = useSelector(state => state.cart.cartItems);
    const { data: session } = useSession();
    const dispatch = useDispatch();
    const router = useRouter()

    // Hàm lấy link ảnh an toàn hỗ trợ cả Static Import (đối tượng) và URL String
    const getImageUrl = (img) => {
        if (!img) return "https://via.placeholder.com/500"
        if (typeof img === 'string') {
            try {
                if (img.startsWith('[') && img.endsWith(']')) {
                    const parsed = JSON.parse(img)
                    return parsed[0] || "https://via.placeholder.com/500"
                }
            } catch (e) {}
            return img
        }
        // Nếu là Static Import của Next.js, lấy thuộc tính .src
        return img.src || img
    }

    // Xử lý an toàn cho mảng ảnh
    let productImages = []
    if (product.images) {
        if (Array.isArray(product.images)) {
            productImages = product.images.map(img => getImageUrl(img))
        } else {
            productImages = [getImageUrl(product.images)]
        }
    }

    if (productImages.length === 0) {
        productImages = ["https://via.placeholder.com/500"]
    }

    const [mainImage, setMainImage] = useState(productImages[0]);

    useEffect(() => {
        setMainImage(productImages[0])
    }, [product.id])

    const addToCartHandler = () => {
        dispatch(addToCart({ productId }))
    }

    const handleCartClick = () => {
        if (!session) {
            return router.push(`/login?redirect=/product/${productId}`)
        }

        if (!cart[productId]) {
            addToCartHandler()
        } else {
            router.push('/cart')
        }
    }

    const ratingList = product.rating || []
    const averageRating = ratingList.length > 0
        ? ratingList.reduce((acc, item) => acc + item.rating, 0) / ratingList.length
        : 0;
    
    return (
        <div className="flex max-lg:flex-col gap-12">
            <div className="flex max-sm:flex-col-reverse gap-3">
                <div className="flex sm:flex-col gap-3">
                    {productImages.map((image, index) => (
                        <div key={index} onClick={() => setMainImage(image)} className="bg-slate-100 flex items-center justify-center size-26 rounded-lg group cursor-pointer overflow-hidden p-1">
                            <img src={image} className="group-hover:scale-103 group-active:scale-95 transition max-h-full max-w-full object-contain" alt="" />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg p-6 overflow-hidden">
                    <img src={mainImage} alt={product.name} className="max-h-full max-w-full object-contain" />
                </div>
            </div>
            <div className="flex-1">
                <h1 className="text-3xl font-semibold text-slate-800">{product.name}</h1>
                <div className='flex items-center mt-2'>
                    {Array(5).fill('').map((_, index) => (
                        <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                    ))}
                    <p className="text-sm ml-3 text-slate-500">{ratingList.length} Reviews</p>
                </div>
                <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
                    <p> {currency}{Number(product.price).toLocaleString()} </p>
                    <p className="text-xl text-slate-500 line-through">{currency}{Number(product.mrp || product.price).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                    <TagIcon size={14} />
                    <p>Tiết kiệm {product.mrp > product.price ? ((product.mrp - product.price) / product.mrp * 100).toFixed(0) : 0}% ngay bây giờ</p>
                </div>
                <div className="flex items-end gap-5 mt-10">
                    {
                        cart[productId] && (
                            <div className="flex flex-col gap-3">
                                <p className="text-lg text-slate-800 font-semibold">Số lượng</p>
                                <Counter productId={productId} />
                            </div>
                        )
                    }
                    <button onClick={handleCartClick} className="bg-slate-800 text-white px-10 py-3 text-sm font-medium rounded hover:bg-slate-900 active:scale-95 transition">
                        {!cart[productId] ? 'Thêm vào giỏ' : 'Xem giỏ hàng'}
                    </button>
                </div>
                <hr className="border-gray-300 my-5" />
                <div className="flex flex-col gap-4 text-slate-500">
                    <p className="flex gap-3"> <EarthIcon className="text-slate-400" /> Miễn phí vận chuyển toàn cầu </p>
                    <p className="flex gap-3"> <CreditCardIcon className="text-slate-400" /> Thanh toán 100% an toàn </p>
                    <p className="flex gap-3"> <UserIcon className="text-slate-400" /> Được tin tưởng bởi các thương hiệu hàng đầu </p>
                </div>

            </div>
        </div>
    )
}

export default ProductDetails
