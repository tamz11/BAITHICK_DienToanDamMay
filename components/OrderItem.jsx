'use client'
import Image from "next/image";
import { DotIcon, CheckCircle } from "lucide-react";
import { useSelector } from "react-redux";
import Rating from "./Rating";
import { useState } from "react";
import RatingModal from "./RatingModal";
import toast from 'react-hot-toast';

const OrderItem = ({ order, onConfirm }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const [ratingModal, setRatingModal] = useState(null);
    const [confirming, setConfirming] = useState(false);

    const { ratings } = useSelector(state => state.rating);

    // Hàm phụ trợ xử lý ảnh để tránh lỗi ảnh bị vỡ
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

    // Hàm xử lý xác nhận đã nhận hàng
    const handleConfirmOrder = async () => {
        if (!confirm("Bạn xác nhận đã nhận được đơn hàng này?")) return;

        setConfirming(true);
        try {
            const res = await fetch(`/api/orders/${order.id}/confirm`, {
                method: 'POST',
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Xác nhận đã nhận hàng thành công!");
                // Reload lại trang hoặc gọi callback để cập nhật giao diện
                window.location.reload();
            } else {
                toast.error(data.error || "Có lỗi xảy ra");
            }
        } catch (error) {
            toast.error("Lỗi kết nối máy chủ");
        } finally {
            setConfirming(false);
        }
    };

    const getStatusStyles = (status) => {
        const s = status.toLowerCase();
        if (s === 'delivered') return 'border-green-200 bg-green-50 text-green-700';
        if (s === 'shipped') return 'border-blue-200 bg-blue-50 text-blue-700';
        if (s === 'processing') return 'border-amber-200 bg-amber-50 text-amber-700';
        if (s === 'cancelled') return 'border-red-200 bg-red-50 text-red-700';
        return 'border-slate-200 bg-slate-50 text-slate-700';
    };

    return (
        <>
            <tr className="text-sm">
                <td className="text-left">
                    <div className="flex flex-col gap-6">
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-20 aspect-square bg-slate-50 flex items-center justify-center rounded-md overflow-hidden border border-slate-100">
                                    <Image
                                        className="h-14 w-auto object-contain"
                                        src={getProductImage(item.product.images)}
                                        alt={item.product.name}
                                        width={50}
                                        height={50}
                                    />
                                </div>
                                <div className="flex flex-col justify-center text-sm">
                                    <p className="font-bold text-slate-700 text-base">{item.product.name}</p>
                                    <p className="text-slate-500">{currency}{item.price} x {item.quantity} </p>
                                    <p className="text-[11px] text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    <div className="mt-2">
                                        {ratings.find(rating => order.id === rating.orderId && item.product.id === rating.productId)
                                            ? <Rating value={ratings.find(rating => order.id === rating.orderId && item.product.id === rating.productId).rating} />
                                            : (order.status && String(order.status).toLowerCase().includes('deliver')) && (
                                                <button
                                                    onClick={() => setRatingModal({ orderId: order.id, productId: item.product.id })}
                                                    className="text-xs font-bold text-emerald-600 hover:underline"
                                                >
                                                    Đánh giá sản phẩm
                                                </button>
                                            )
                                        }
                                    </div>
                                    {ratingModal && <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </td>

                <td className="text-center max-md:hidden font-bold text-slate-800">{currency}{order.total.toLocaleString()}</td>

                <td className="text-left max-md:hidden text-xs text-slate-500 leading-relaxed">
                    <p className="font-bold text-slate-700">{order.address.name}</p>
                    <p>{order.address.street}, {order.address.city}</p>
                    <p>{order.address.state} - {order.address.zip}</p>
                    <p>SĐT: {order.address.phone}</p>
                </td>

                <td className="text-left space-y-3 text-sm max-md:hidden min-w-[180px]">
                    <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 w-fit font-bold text-[10px] uppercase tracking-wider ${getStatusStyles(order.status)}`}>
                        <DotIcon size={14} />
                        {order.status.replace(/_/g, ' ')}
                    </div>

                    {/* NÚT XÁC NHẬN NHẬN HÀNG */}
                    {order.status && String(order.status).toLowerCase().includes('ship') && (
                        <button
                            onClick={handleConfirmOrder}
                            disabled={confirming}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            <CheckCircle size={14} />
                            {confirming ? "Đang xử lý..." : "Đã nhận được hàng"}
                        </button>
                    )}

                    {order.isCouponUsed && order.coupon?.code && (
                        <div className="text-[10px] text-slate-400 font-medium italic">
                            Đã áp dụng mã: <span className="text-indigo-600 font-bold">{order.coupon.code}</span>
                        </div>
                    )}
                </td>
            </tr>
            <tr>
                <td colSpan={4}>
                    <div className="border-b border-slate-100 w-full my-4" />
                </td>
            </tr>
        </>
    )
}

export default OrderItem;
