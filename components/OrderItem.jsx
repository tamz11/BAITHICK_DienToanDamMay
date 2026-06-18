'use client'
import Image from "next/image";
import { DotIcon } from "lucide-react";
import { useSelector } from "react-redux";
import Rating from "./Rating";
import { useState } from "react";
import RatingModal from "./RatingModal";

const OrderItem = ({ order }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const [ratingModal, setRatingModal] = useState(null);

    const { ratings } = useSelector(state => state.rating);

    return (
        <>
            <tr className="text-sm">
                <td className="text-left">
                    <div className="flex flex-col gap-6">
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-20 aspect-square bg-slate-100 flex items-center justify-center rounded-md">
                                    <Image
                                        className="h-14 w-auto"
                                        src={item.product.images[0]}
                                        alt="product_img"
                                        width={50}
                                        height={50}
                                    />
                                </div>
                                <div className="flex flex-col justify-center text-sm">
                                    <p className="font-medium text-slate-600 text-base">{item.product.name}</p>
                                    <p>{currency}{item.price} Qty : {item.quantity} </p>
                                    <p className="mb-1">{new Date(order.createdAt).toDateString()}</p>
                                    <div>
                                        {ratings.find(rating => order.id === rating.orderId && item.product.id === rating.productId)
                                            ? <Rating value={ratings.find(rating => order.id === rating.orderId && item.product.id === rating.productId).rating} />
                                            : <button onClick={() => setRatingModal({ orderId: order.id, productId: item.product.id })} className={`text-green-500 hover:bg-green-50 transition ${order.status !== "DELIVERED" && 'hidden'}`}>Rate Product</button>
                                        }</div>
                                    {ratingModal && <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </td>

                <td className="text-center max-md:hidden">{currency}{order.total}</td>

                <td className="text-left max-md:hidden">
                    <p>{order.address.name}, {order.address.street},</p>
                    <p>{order.address.city}, {order.address.state}, {order.address.zip}, {order.address.country},</p>
                    <p>{order.address.phone}</p>
                </td>

                <td className="text-left space-y-2 text-sm max-md:hidden">
                    <div
                        className={`flex items-center justify-between gap-2 rounded-3xl border px-3 py-2 ${order.status === 'confirmed'
                            ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                            : order.status === 'delivered'
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : 'border-slate-200 bg-slate-50 text-slate-700'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            <DotIcon size={10} className="scale-250" />
                            {order.status.split('_').join(' ').toLowerCase()}
                        </span>
                        {order.isCouponUsed && order.coupon?.code ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{order.coupon.code}</span>
                        ) : null}
                    </div>
                </td>
            </tr>
            {/* Mobile */}
            <tr className="md:hidden">
                <td colSpan={5}>
                    <p className="font-medium text-slate-700">{order.address.name}, {order.address.street}</p>
                    <p className="text-sm text-slate-500">{order.address.city}, {order.address.state}, {order.address.zip}, {order.address.country}</p>
                    <p className="text-sm text-slate-500">{order.address.phone}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className='px-4 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold'>
                            {order.status.replace(/_/g, ' ').toLowerCase()}
                        </span>
                        {order.isCouponUsed && order.coupon?.code ? (
                            <span className='px-4 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold'>Coupon: {order.coupon.code}</span>
                        ) : null}
                    </div>
                </td>
            </tr>
            <tr>
                <td colSpan={4}>
                    <div className="border-b border-slate-300 w-6/7 mx-auto" />
                </td>
            </tr>
        </>
    )
}

export default OrderItem