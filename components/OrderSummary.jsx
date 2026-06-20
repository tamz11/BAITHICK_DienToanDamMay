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

    const addressList = useSelector(state => state.address.list);

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState(null);
    const [loadingCoupon, setLoadingCoupon] = useState(false);
    const [loadingOrder, setLoadingOrder] = useState(false);

    const handleSelectAddress = (event) => {
        const address = addressList.find((item) => item.id === event.target.value);
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

        // Get storeId from first item
        const storeId = items[0]?.storeId;
        if (!storeId) {
            toast.error('Không tìm thấy cửa hàng');
            return;
        }

        // Prepare order items
        const orderItems = items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
        }));

        // Calculate final price
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
                    addressId: selectedAddress.id,
                    address: selectedAddress,
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

            // Clear cart
            dispatch(clearCart());

            // Show success message
            toast.success('Đặt hàng thành công!');

            // Redirect to orders page
            setTimeout(() => {
                router.push('/orders');
            }, 1500);
        } catch (err) {
            console.error('Checkout error:', err);
            toast.error(err.message || 'Lỗi đặt hàng');
        } finally {
            setLoadingOrder(false);
        }
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>
            <h2 className='text-xl font-medium text-slate-600'>Tóm tắt thanh toán</h2>
            <p className='text-slate-400 text-xs my-4'>Phương thức thanh toán</p>
            <div className='flex gap-2 items-center'>
                <input type="radio" id="COD" onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} className='accent-gray-500' />
                <label htmlFor="COD" className='cursor-pointer'>Thanh toán khi nhận hàng</label>
            </div>
            <div className='flex gap-2 items-center mt-1'>
                <input type="radio" id="STRIPE" name='payment' onChange={() => setPaymentMethod('STRIPE')} checked={paymentMethod === 'STRIPE'} className='accent-gray-500' />
                <label htmlFor="STRIPE" className='cursor-pointer'>Thanh toán bằng Stripe</label>
            </div>
            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p>Địa chỉ</p>
                {
                    selectedAddress ? (
                        <div className='flex gap-2 items-center'>
                            <p>{selectedAddress.name}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.zip}</p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer' size={18} />
                        </div>
                    ) : (
                        <div>
                            {
                                addressList.length > 0 && (
                                    <select className='border border-slate-400 p-2 w-full my-3 outline-none rounded' value={selectedAddress?.id || ''} onChange={handleSelectAddress} >
                                        <option value="">Chọn địa chỉ</option>
                                        {
                                            addressList.map((address) => (
                                                <option key={address.id} value={address.id}>{address.name}, {address.city}, {address.state}, {address.zip}</option>
                                            ))
                                        }
                                    </select>
                                )
                            }
                            <button className='flex items-center gap-1 text-slate-600 mt-1' onClick={() => setShowAddressModal(true)} >Thêm địa chỉ <PlusIcon size={18} /></button>
                        </div>
                    )
                }
            </div>
            <div className='pb-4 border-b border-slate-200'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>Tổng phụ:</p>
                        <p>Vận chuyển:</p>
                        {coupon && <p>Mã giảm giá:</p>}
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p>{currency}{totalPrice.toLocaleString()}</p>
                        <p>Miễn phí</p>
                        {coupon && <p>{`-${currency}${(coupon.discount / 100 * totalPrice).toFixed(2)}`}</p>}
                    </div>
                </div>
                {
                    !coupon ? (
                        <form onSubmit={handleCouponCode} className='flex justify-center gap-3 mt-3'>
                            <input 
                                onChange={(e) => setCouponCodeInput(e.target.value)} 
                                value={couponCodeInput} 
                                type="text" 
                                placeholder='Mã giảm giá' 
                                className='border border-slate-400 p-1.5 rounded w-full outline-none' 
                                disabled={loadingCoupon}
                            />
                            <button 
                                type='submit'
                                disabled={loadingCoupon}
                                className='bg-slate-600 text-white px-3 rounded hover:bg-slate-800 active:scale-95 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed'>
                                {loadingCoupon ? 'Đang...' : 'Áp dụng'}
                            </button>
                        </form>
                    ) : (
                        <div className='w-full flex items-center justify-center gap-2 text-xs mt-2'>
                            <p>Mã: <span className='font-semibold ml-1'>{coupon.code.toUpperCase()}</span></p>
                            <p>{coupon.description}</p>
                            <XIcon size={18} onClick={() => setCoupon(null)} className='hover:text-red-700 transition cursor-pointer' />
                        </div>
                    )
                }
            </div>
            <div className='flex justify-between py-4'>
                <p>Tổng cộng:</p>
                <p className='font-medium text-right'>{currency}{coupon ? (totalPrice - (coupon.discount / 100 * totalPrice)).toFixed(2) : totalPrice.toLocaleString()}</p>
            </div>
            <button 
                onClick={handlePlaceOrder} 
                disabled={loadingOrder}
                className='w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed'>
                {loadingOrder ? 'Đang đặt hàng...' : 'Đặt hàng'}
            </button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}

        </div>
    )
}

export default OrderSummary