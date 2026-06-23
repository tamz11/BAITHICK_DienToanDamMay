'use client'
import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import { Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Cart() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const { cartItems } = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);
    const { data: session } = useSession();
    const dispatch = useDispatch();
    const router = useRouter();

    const [cartArray, setCartArray] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    // Hàm phụ trợ xử lý ảnh (vì images lưu trong DB có thể là chuỗi JSON)
    const getProductImage = (images) => {
        if (!images) return "/placeholder.png";
        try {
            if (typeof images === 'string' && images.startsWith('[')) {
                const parsed = JSON.parse(images);
                return parsed[0] || "/placeholder.png";
            }
            return typeof images === 'string' ? images : "/placeholder.png";
        } catch (e) {
            return "/placeholder.png";
        }
    };

    const createCartArray = () => {
        let total = 0;
        const tempCart = [];
        for (const [key, value] of Object.entries(cartItems)) {
            const product = products.find(p => p.id === key);
            if (product) {
                tempCart.push({ ...product, quantity: value });
                total += product.price * value;
            }
        }
        setTotalPrice(total);
        setCartArray(tempCart);
    }

    useEffect(() => {
        if (!session) {
            router.push('/login?redirect=/cart');
            return;
        }
        if (products.length > 0) createCartArray();
    }, [cartItems, products, session]);

    if (!session) return <div className="min-h-screen flex items-center justify-center text-slate-500">Đang kiểm tra đăng nhập...</div>;

    return cartArray.length > 0 ? (
        <div className="min-h-screen mx-6 text-slate-800 pb-20">
            <div className="max-w-7xl mx-auto">
                <PageTitle heading="Giỏ hàng của tôi" text={`${cartArray.length} mục trong giỏ hàng`} linkText="Thêm sản phẩm" />
                <div className="flex items-start justify-between gap-10 max-lg:flex-col">
                    <table className="w-full max-w-4xl text-slate-600 table-auto border-separate border-spacing-y-4">
                        <thead>
                            <tr className="text-slate-400 text-xs uppercase tracking-widest border-b">
                                <th className="text-left pb-4 px-2">Sản phẩm</th>
                                <th className="pb-4">Số lượng</th>
                                <th className="pb-4">Tổng cộng</th>
                                <th className="max-md:hidden pb-4">Xóa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartArray.map((item, index) => (
                                <tr key={index} className="bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-100">
                                    <td className="p-4 rounded-l-2xl border-y border-l">
                                        <div className="flex gap-4 items-center">
                                            <div className="bg-slate-50 size-20 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100">
                                                <Image
                                                    src={getProductImage(item.images)}
                                                    className="object-contain"
                                                    alt={item.name}
                                                    width={60}
                                                    height={60}
                                                />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{item.category}</p>
                                                <p className="text-indigo-600 font-bold text-xs mt-1">{currency}{item.price}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center border-y">
                                        <Counter productId={item.id} />
                                    </td>
                                    <td className="text-center font-bold text-slate-700 border-y">
                                        {currency}{(item.price * item.quantity).toLocaleString()}
                                    </td>
                                    <td className="text-center max-md:hidden rounded-r-2xl border-y border-r px-4">
                                        <button onClick={() => dispatch(deleteItemFromCart({ productId: item.id }))} className="text-rose-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-full transition-all active:scale-90">
                                            <Trash2Icon size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <OrderSummary totalPrice={totalPrice} items={cartArray} />
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-slate-400 gap-4">
            <h1 className="text-2xl font-bold">Giỏ hàng của bạn đang trống</h1>
            <button onClick={() => router.push('/')} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100">Mua sắm ngay</button>
        </div>
    );
}
