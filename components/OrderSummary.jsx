'use client'
import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react'
import AddressModal from './AddressModal';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { clearCart } from '@/lib/features/cart/cartSlice';

const OrderSummary = ({ totalPrice, items }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

    const router = useRouter();
    const dispatch = useDispatch();
    const { data: session } = useSession();

    const addressList = useSelector(state => state.address.list) || [];

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState(null);
    const [loadingCoupon, setLoadingCoupon] = useState(false);
    const [loadingOrder, setLoadingOrder] = useState(false);

    // XỬ LÝ CHỌN ĐỊA CHỈ VÀ ÁP DỤNG MÃ GIẢM GIÁ
    const handleSelectAddress = (event) => {
        const address = addressList.find((item) => String(item.id) === String(event.target.value));
        setSelectedAddress(address || null);
    };

    const handleCouponCode = async (event) => {
        event.preventDefault();

        if (!couponCodeInput.trim()) {
            toast.error('Vui lòng nhập mã giảm giá');
            return;
        }

        setLoadingCoupon(true);
        try {
            const response = await fetch('/api/coupons/validate', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: couponCodeInput.replace(/\s+/g, '').toUpperCase(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Lỗi kiểm tra mã giảm giá');
            }

            setCoupon(data.data);
            setCouponCodeInput('');
            toast.success(`Áp dụng mã "${data.data.code}" thành công!`);
        } catch (err) {
            console.error('Coupon validation error:', err);
            toast.error(err.message || 'Lỗi kiểm tra mã giảm giá');
        } finally {
            setLoadingCoupon(false);
        }
    }

    // XỬ LÝ ĐẶT HÀNG
    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!session) {
            router.push('/login?redirect=/cart')
            return;
        }

        if (!selectedAddress) {
            toast.error('Vui lòng chọn địa chỉ giao hàng');
            return;
        }

        if (!items || items.length === 0) {
            toast.error('Giỏ hàng trống');
            return;
        }

        const storeId = items[0]?.storeId;
        if (!storeId) {
            toast.error('Không tìm thấy cửa hàng');
            return;
        }

        const orderItems = items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
        }));

        let finalPrice = totalPrice;
        if (coupon) {
            finalPrice = totalPrice - (coupon.discount / 100 * totalPrice);
        }

        setLoadingOrder(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    addressId: selectedAddress?.id || null,
                    address: selectedAddress,
                    shippingAddress: {
                        name: selectedAddress?.name || "",
                        city: selectedAddress?.city || "",
                        state: selectedAddress?.state || "",
                        zip: selectedAddress?.zip || ""
                    },
                    paymentMethod,
                    items: orderItems,
                    coupon: coupon || null,
                    totalPrice: finalPrice,
                    storeId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Lỗi đặt hàng');
            }

            dispatch(clearCart());
            toast.success('Đặt hàng thành công!');
            setTimeout(() => router.push('/orders'), 1500);
        } catch (err) {
            console.error('Checkout error:', err);
            toast.error(err.message || 'Lỗi đặt hàng');
        } finally {
            setLoadingOrder(false);
        }
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7 shrink-0 h-fit'>
            <h2 className='text-xl font-medium text-slate-600'>Tóm tắt thanh toán</h2>
            <p className='text-slate-400 text-xs my-4'>Phương thức thanh toán</p>
            <div className='flex gap-2 items-center'>
                <input type="radio" id="COD" onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} className='accent-gray-500 cursor-pointer' />
                <label htmlFor="COD" className='cursor-pointer select-none'>Thanh toán khi nhận hàng</label>
            </div>
            <div className='flex gap-2 items-center mt-1'>
                <input type="radio" id="STRIPE" name='payment' onChange={() => setPaymentMethod('STRIPE')} checked={paymentMethod === 'STRIPE'} className='accent-gray-500 cursor-pointer' />
                <label htmlFor="STRIPE" className='cursor-pointer select-none'>Thanh toán bằng Stripe</label>
            </div>

            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p className="mb-2 text-xs">Địa chỉ nhận hàng</p>
                {selectedAddress ? (
                    <div className='flex gap-3 items-center bg-slate-100/60 p-2.5 rounded-lg border border-slate-200 text-slate-700 justify-between'>
                        <p className="text-xs font-medium leading-relaxed truncate flex-1">{selectedAddress.name}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.zip}</p>
                        <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer text-slate-400 hover:text-slate-700 transition shrink-0' size={16} />
                    </div>
                ) : (
                    <div>
                        {addressList.length > 0 && (
                            <select className='border border-slate-400 p-2 w-full my-3 outline-none rounded' value={selectedAddress?.id || ''} onChange={handleSelectAddress}>
                                <option value="">Chọn địa chỉ</option>
                                {addressList.map(address => (
                                    <option key={address.id} value={address.id}>{address.name}, {address.city}, {address.state}, {address.zip}</option>
                                ))}
                            </select>
                        )}
                        <button className='flex items-center gap-1 text-xs text-slate-600 font-semibold mt-1 hover:text-slate-900 transition cursor-pointer' onClick={() => setShowAddressModal(true)}>
                            Thêm địa chỉ mới <PlusIcon size={14} />
                        </button>
                    </div>
                )}
            </div>

            <div className='pb-4 border-b border-slate-200 text-xs'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-2 text-slate-400'>
                        <p>Tổng phụ:</p>
                        <p>Vận chuyển:</p>
                        {coupon && <p>Mã giảm giá:</p>}
                    </div>
                    <div className='flex flex-col gap-2 font-medium text-right text-slate-700'>
                        <p>{currency}{Number(totalPrice).toLocaleString()}</p>
                        <p className="text-green-600 font-semibold">Miễn phí</p>
                        {coupon && <p className="text-red-500">{`-${currency}${((coupon.discount / 100) * totalPrice).toFixed(2)}`}</p>}
                    </div>
                </div>

                {!coupon ? (
                    <form onSubmit={handleCouponCode} className='flex justify-center gap-2 mt-4'>
                        <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder='Nhập mã giảm giá' className='border border-slate-300 p-1.5 rounded text-xs w-full outline-none bg-white text-slate-700' disabled={loadingCoupon} />
                        <button type='submit' disabled={loadingCoupon} className='bg-slate-700 text-white text-xs px-3 rounded hover:bg-slate-900 active:scale-95 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed cursor-pointer shrink-0'>
                            {loadingCoupon ? 'Đang...' : 'Áp dụng'}
                        </button>
                    </form>
                ) : (
                    <div className='w-full flex items-center justify-between gap-2 text-xs mt-3 bg-green-50 text-green-800 p-2 rounded-lg border border-green-200'>
                        <div className="truncate"><p className="font-bold">Mã: {coupon.code.toUpperCase()}</p><p className="text-[11px] text-green-600 truncate">{coupon.description}</p></div>
                        <XIcon size={16} onClick={() => setCoupon(null)} className='hover:text-red-700 transition cursor-pointer shrink-0' />
                    </div>
                )}
            </div>

            <div className='flex justify-between py-4 items-center'>
                <p className="font-medium text-slate-700">Tổng cộng:</p>
                <p className='font-bold text-lg text-slate-900'>{currency}{coupon ? (totalPrice - ((coupon.discount / 100) * totalPrice)).toLocaleString(undefined, {maximumFractionDigits: 2}) : totalPrice.toLocaleString()}</p>
            </div>

            <button onClick={handlePlaceOrder} disabled={loadingOrder} className='w-full bg-slate-800 text-white py-2.5 rounded-lg font-medium hover:bg-slate-900 active:scale-95 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed cursor-pointer text-sm shadow-sm'>
                {loadingOrder ? 'Đang xử lý đặt hàng...' : 'Xác nhận Đặt hàng'}
            </button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}
        </div>
    )
}

export default OrderSummary
