'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"; 
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";

const ProductDetails = ({ product }) => {

    const productId = product?.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

    const cart = useSelector(state => state.cart.cartItems);
    const { data: session } = useSession();
    const dispatch = useDispatch();
    const router = useRouter();

    // ➔ ĐÃ GỘP: Hàm lấy link ảnh an toàn hỗ trợ cả Static Import (đối tượng), chuỗi văn bản Base64 và mảng JSON chuỗi
    const getImageUrl = (img) => {
        if (!img) return "/placeholder.png";
        if (typeof img === 'string') {
            try {
                if (img.startsWith('[') && img.endsWith(']')) {
                    const parsed = JSON.parse(img);
                    return parsed[0] || "/placeholder.png";
                }
            } catch (e) {}
            return img; // Trả về chuỗi Base64 hoặc link ảnh dạng String trực tiếp
        }
        // Nếu là Static Import của Next.js, lấy thuộc tính .src
        return img.src || img;
    };

    // Xử lý an toàn để chuyển đổi tất cả dữ liệu ảnh về một mảng chuẩn để chạy vòng lặp .map()
    let productImages = [];
    if (product?.images) {
        if (Array.isArray(product.images)) {
            productImages = product.images.map(img => getImageUrl(img));
        } else {
            productImages = [getImageUrl(product.images)];
        }
    }

    if (productImages.length === 0) {
        productImages = ["/placeholder.png"];
    }

    const [mainImage, setMainImage] = useState(productImages[0]);

    // ➔ ĐÃ GIỮ LẠI: Theo dõi nếu khách chuyển sang xem sản phẩm khác thì tự đổi ảnh chính theo sản phẩm đó
    useEffect(() => {
        setMainImage(productImages[0]);
    }, [product, productId]);

    const addToCartHandler = () => {
        dispatch(addToCart({ productId }));
    };

    const handleCartClick = () => {
        if (!session) {
            return router.push(`/login?redirect=/product/${productId}`);
        }

        if (!cart[productId]) {
            addToCartHandler();
        } else {
            router.push('/cart');
        }
    };

    // ➔ ĐÃ GỘP: Chốt chặn an toàn tính sao đánh giá (Không lo bị undefined làm sập trang)
    const ratingList = product?.rating || [];
    const averageRating = ratingList.length > 0
        ? ratingList.reduce((acc, item) => acc + item.rating, 0) / ratingList.length
        : 4; // Mặc định cho 4 sao nếu chưa ai đánh giá để giao diện đẹp mắt

    return (
        <div className="flex max-lg:flex-col gap-12">
            <div className="flex max-sm:flex-col-reverse gap-3">
                {/* Danh sách các ảnh nhỏ thumbnail phụ bên cạnh */}
                <div className="flex sm:flex-col gap-3">
                    {productImages.map((image, index) => (
                        <div 
                            key={index} 
                            onClick={() => setMainImage(image)} 
                            className="bg-slate-100 flex items-center justify-center size-26 rounded-lg group cursor-pointer overflow-hidden p-1 border border-slate-50"
                        >
                            <img 
                                src={image} 
                                className="group-hover:scale-103 group-active:scale-95 transition max-h-full max-w-full object-contain" 
                                alt="" 
                                style={{ width: '45px', height: '45px' }}
                            />
                        </div>
                    ))}
                </div>
                {/* Khung ảnh to chính giữa */}
                <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg p-6 overflow-hidden border border-slate-50">
                    <img 
                        src={mainImage} 
                        alt={product?.name} 
                        className="max-h-full max-w-full object-contain transition duration-300" 
                        style={{ maxWidth: '250px', maxHeight: '250px' }}
                    />
                </div>
            </div>
            
            {/* KHUNG HIỂN THỊ THÔNG TIN CHI TIẾT */}
            <div className="flex-1">
                <h1 className="text-3xl font-semibold text-slate-800">{product?.name}</h1>
                <div className='flex items-center mt-2'>
                    {Array(5).fill('').map((_, index) => (
                        <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                    ))}
                    <p className="text-sm ml-3 text-slate-500">{ratingList.length} Reviews</p>
                </div>
                <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
                    <p> {currency}{Number(product?.price).toLocaleString()} </p>
                    {product?.mrp > product?.price && (
                        <p className="text-xl text-slate-500 line-through">{currency}{Number(product.mrp).toLocaleString()}</p>
                    )}
                </div>
                
                {/* Phần trăm tiết kiệm */}
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <TagIcon size={14} />
                    {/* ➔ ĐÃ GIỮ LẠI: Chốt chặn an toàn toán tử && đề phòng chia cho số 0 sinh lỗi NaN */}
                    <p>
                        Tiết kiệm {product?.mrp && product.mrp > product.price 
                            ? ((product.mrp - product.price) / product.mrp * 100).toFixed(0) 
                            : 0}% ngay bây giờ
                    </p>
                </div>
                
                {/* Khung tương tác nút Giỏ hàng */}
                <div className="flex items-end gap-5 mt-10">
                    {
                        cart[productId] && (
                            <div className="flex flex-col gap-3">
                                <p className="text-lg text-slate-800 font-semibold">Số lượng</p>
                                <Counter productId={productId} />
                            </div>
                        )
                    }
                    <button onClick={handleCartClick} className="bg-slate-800 text-white px-10 py-3 text-sm font-medium rounded hover:bg-slate-900 active:scale-95 transition cursor-pointer">
                        {!cart[productId] ? 'Thêm vào giỏ' : 'Xem giỏ hàng'}
                    </button>
                </div>
                
                <hr className="border-gray-300 my-5" />
                <div className="flex flex-col gap-4 text-slate-500 text-sm">
                    <p className="flex gap-3"> <EarthIcon className="text-slate-400" size={18} /> Miễn phí vận chuyển toàn cầu </p>
                    <p className="flex gap-3"> <CreditCardIcon className="text-slate-400" size={18} /> Thanh toán 100% an toàn </p>
                    <p className="flex gap-3"> <UserIcon className="text-slate-400" size={18} /> Được tin tưởng bởi các thương hiệu hàng đầu </p>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails;