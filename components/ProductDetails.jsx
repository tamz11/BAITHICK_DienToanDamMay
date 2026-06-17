'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"; // ➔ THÊM: useEffect để đồng bộ ảnh
import Image from "next/image";
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

    // ➔ ĐÃ SỬA 1: Chuẩn hóa trường ảnh (Dù là Mảng mẫu hay Chuỗi thật thì đều chuyển thành Mảng xử lý)
    let imagesArray = [];
    if (product?.images) {
        imagesArray = Array.isArray(product.images) ? product.images : [product.images];
    }
    if (imagesArray.length === 0) {
        imagesArray = ['/placeholder.png']; // Ảnh dự phòng nếu không có ảnh
    }

    const [mainImage, setMainImage] = useState(imagesArray[0]);

    // ➔ ĐÃ THÊM: Theo dõi nếu khách chuyển sang xem sản phẩm khác thì tự đổi ảnh chính theo sản phẩm đó
    useEffect(() => {
        setMainImage(imagesArray[0]);
    }, [product, product?.id]);

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

   // ➔ ĐÃ SỬA 2: Chốt chặn an toàn tính sao đánh giá (Không lo bị undefined làm sập trang)
    const ratingArray = product?.rating || [];
    const averageRating = ratingArray.length > 0
        ? ratingArray.reduce((acc, item) => acc + item.rating, 0) / ratingArray.length
        : 4; // Mặc định cho 4 sao nếu chưa ai đánh giá để giao diện đẹp

    // Hàm bốc tách lấy đường dẫn chuỗi chuẩn cho thẻ img (Hỗ trợ tốt cả Object Next.js lẫn Base64)
    const getSrc = (img) => {
        if (!img) return '/placeholder.png';
        return (typeof img === 'object' && img.src) ? img.src : img;
    };
    
    return (
        <div className="flex max-lg:flex-col gap-12">
            <div className="flex max-sm:flex-col-reverse gap-3">
                <div className="flex sm:flex-col gap-3">
                    {imagesArray.map((image, index) => (
                        <div key={index} onClick={() => setMainImage(imagesArray[index])} className="bg-slate-100 flex items-center justify-center size-26 rounded-lg group cursor-pointer">
                            <img src={getSrc(image)} className="group-hover:scale-103 group-active:scale-95 transition" alt="" width={45} height={45} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg ">
                    <img 
                        src={getSrc(mainImage)} 
                        alt={product?.name} 
                        className="max-h-[80%] w-auto object-contain transition duration-300" 
                        style={{ maxWidth: '250px', maxHeight: '250px' }}
                    />
                </div>
            </div>
            <div className="flex-1">
                <h1 className="text-3xl font-semibold text-slate-800">{product.name}</h1>
                <div className='flex items-center mt-2'>
                    {Array(5).fill('').map((_, index) => (
                        <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                    ))}
                    <p className="text-sm ml-3 text-slate-500">{ratingArray.length} Reviews</p>
                </div>
                <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
                    <p> {currency}{product.price} </p>
                    <p className="text-xl text-slate-500 line-through">{currency}{product.mrp}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                    <TagIcon size={14} />
                    <p>Tiết kiệm {product.mrp && product.mrp > product.price 
                        ? ((product.mrp - product.price) / product.mrp * 100).toFixed(0) 
                        : 0}% ngay bây giờ</p>
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