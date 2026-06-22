'use client'
import { PlusIcon, SquarePenIcon, XIcon, TicketPercent, Check, Info } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import AddressModal from './AddressModal';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { clearCart } from '@/lib/features/cart/cartSlice';
import { setAddressList, setDefaultAddress } from '@/lib/features/address/addressSlice';

const OrderSummary = ({ totalPrice, items }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const router = useRouter();
    const dispatch = useDispatch();
    const { data: session } = useSession();

    const addressList = useSelector(state => state.address.list) || [];
    const addressDefaultId = useSelector(state => state.address.defaultId);

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);

    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState(null);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [loadingCoupon, setLoadingCoupon] = useState(false);
    const [loadingOrder, setLoadingOrder] = useState(false);

    // 📥 TẢI ĐỊA CHỈ & MÃ GIẢM GIÁ
    useEffect(() => {
        const fetchData = async () => {
            if (session) {
                try {
                    // 1. Tải địa chỉ
                    const addrRes = await fetch('/api/address');
                    const addrData = await addrRes.json();
                    if (addrRes.ok) {
                        dispatch(setAddressList(addrData.data));
                    }

                    // 2. Tải danh sách coupon công khai
                    const couponRes = await fetch('/api/coupons');
                    const couponData = await couponRes.json();
                    if (couponRes.ok) {
                        setAvailableCoupons(couponData.data);
                    }
                } catch (error) {
                    console.error("Lỗi tải dữ liệu:", error);
                }
            }
        };
        fetchData();
    }, [session, dispatch]);

    // Tự động chọn địa chỉ (Ưu tiên mặc định, sau đó là địa chỉ đầu tiên)
    useEffect(() => {
        if (addressList.length > 0 && !selectedAddress) {
            const def = addressDefaultId ? addressList.find(a => String(a.id) === String(addressDefaultId)) : null;
            setSelectedAddress(def || addressList[0]);
        }
    }, [addressList, addressDefaultId, selectedAddress]);

    const handleSelectAddress = (event) => {
        const addrId = event.target.value;
        const address = addressList.find((item) => String(item.id) === String(addrId));
        setSelectedAddress(address || null);

        if (address) {
            dispatch(setDefaultAddress(address.id));
            // Lưu trạng thái địa chỉ mặc định lên server (optional)
            fetch('/api/address/default', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ addressId: address.id })
            }).catch(console.warn);
        }
    };

    const applyCoupon = async (code) => {
        if (!code || !code.trim()) return;
        setLoadingCoupon(true);
        try {
            const response = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.toUpperCase() }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Lỗi');

            setCoupon(data.data);
            setCouponCodeInput('');
            toast.success(`Đã áp dụng mã ${data.data.code}!`);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoadingCoupon(false);
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!session) return router.push('/login?redirect=/cart');
        if (!selectedAddress) return toast.error('Vui lòng thêm và chọn địa chỉ giao hàng');
        if (!items || items.length === 0) return toast.error('Giỏ hàng trống');

        setLoadingOrder(true);
        try {
            const orderItems = items.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
            }));

            let finalPrice = totalPrice;
            if (coupon) finalPrice = totalPrice - (coupon.discount / 100 * totalPrice);

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    addressId: selectedAddress.id,
                    paymentMethod,
                    items: orderItems,
                    coupon: coupon || null,
                    totalPrice: finalPrice,
                    storeId: items[0]?.storeId,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Lỗi');

            dispatch(clearCart());
            toast.success(data.message || 'Đặt hàng thành công!');
            setTimeout(() => router.push('/orders'), 1500);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoadingOrder(false);
        }
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-white border border-slate-200 text-slate-500 text-sm rounded-2xl p-7 shadow-sm shrink-0 h-fit'>
            <h2 className='text-xl font-bold text-slate-800 mb-6 uppercase tracking-tight'>Tóm tắt thanh toán</h2>
            
            <p className='text-[10px] font-bold text-slate-400 uppercase mb-3'>Phương thức thanh toán</p>
            <div className='space-y-2 mb-6'>
                <div onClick={() => setPaymentMethod('COD')} className={`flex gap-2 items-center p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100'}`}>
                    <input type="radio" checked={paymentMethod === 'COD'} readOnly className='accent-indigo-600' />
                    <label className='cursor-pointer font-medium text-slate-700 text-xs'>Thanh toán khi nhận hàng</label>
                </div>
                <div onClick={() => setPaymentMethod('STRIPE')} className={`flex gap-2 items-center p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'STRIPE' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100'}`}>
                    <input type="radio" checked={paymentMethod === 'STRIPE'} readOnly className='accent-indigo-600' />
                    <label className='cursor-pointer font-medium text-slate-700 text-xs'>Thanh toán bằng Stripe</label>
                </div>
            </div>

            <div className='my-6 py-4 border-y border-slate-100'>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Địa chỉ nhận hàng</p>
                {selectedAddress ? (
                    <div className='flex gap-3 items-center bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-slate-700 justify-between'>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{selectedAddress.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{selectedAddress.street}, {selectedAddress.city}</p>
                        </div>
                        <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer text-indigo-400 hover:text-indigo-600 shrink-0' size={16} />
                    </div>
                ) : (
                    <div>
                        {addressList.length > 0 && (
                            <select className='border border-slate-200 p-3 w-full mb-3 outline-none rounded-xl bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer focus:border-indigo-500 transition-all'
                                value={selectedAddress?.id || ''} onChange={handleSelectAddress} >
                                <option value="">-- Chọn địa chỉ --</option>
                                {addressList.map((addr) => (
                                    <option key={addr.id} value={addr.id}>{addr.name} - {addr.street}</option>
                                ))}
                            </select>
                        )}
                        <button className='flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:text-indigo-700 transition cursor-pointer px-1' onClick={() => setShowAddressModal(true)} >
                            <PlusIcon size={14} /> Thêm địa chỉ mới
                        </button>
                    </div>
                )}
            </div>

            {/* PHẦN MÃ GIẢM GIÁ CẢI TIẾN */}
            <div className="mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <TicketPercent size={14} className="text-indigo-500" /> Ưu đãi dành cho bạn
                </p>

                {coupon ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                        <div className="flex items-center gap-2">
                            <div className="bg-emerald-500 text-white p-1 rounded-full"><Check size={10} /></div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">{coupon.code}</p>
                                <p className="text-[9px] text-emerald-600 italic">Đã giảm {coupon.discount}%</p>
                            </div>
                        </div>
                        <button onClick={() => setCoupon(null)} className="text-slate-400 hover:text-rose-500 transition-colors"><XIcon size={14} /></button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <form onSubmit={(e) => { e.preventDefault(); applyCoupon(couponCodeInput); }} className='flex gap-2'>
                            <input
                                onChange={(e) => setCouponCodeInput(e.target.value)}
                                value={couponCodeInput}
                                type="text"
                                placeholder='Nhập mã giảm giá...'
                                className='flex-1 border border-slate-200 px-4 py-2.5 rounded-xl text-xs outline-none focus:border-indigo-500 bg-slate-50/50'
                            />
                            <button type='submit' disabled={loadingCoupon || !couponCodeInput.trim()} className='bg-slate-800 text-white text-[10px] px-4 py-2.5 rounded-xl font-bold uppercase disabled:bg-slate-200 transition-all active:scale-95'>
                                Áp dụng
                            </button>
                        </form>

                        {availableCoupons.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {availableCoupons.map((c) => (
                                    <button
                                        key={c.code}
                                        disabled={!c.isEligible || loadingCoupon}
                                        onClick={() => applyCoupon(c.code)}
                                        className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5
                                            ${c.isEligible
                                                ? 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 cursor-pointer'
                                                : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-60'}`}
                                        title={c.isEligible ? c.description : "Bạn chưa đủ điều kiện dùng mã này"}
                                    >
                                        {c.code}
                                        {!c.isEligible && <Info size={10} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className='space-y-2.5 mb-6 text-xs border-t border-slate-50 pt-4'>
                <div className='flex justify-between'><span className="text-slate-400">Tổng phụ:</span><span className="font-bold text-slate-700">{currency}{Number(totalPrice).toLocaleString()}</span></div>
                <div className='flex justify-between'><span className="text-slate-400">Vận chuyển:</span><span className="text-emerald-600 font-bold uppercase text-[10px]">Miễn phí</span></div>
                {coupon && (
                    <div className='flex justify-between animate-in fade-in'>
                        <span className="text-slate-400">Giảm giá ({coupon.discount}%):</span>
                        <span className="text-rose-500 font-bold">-{currency}{((coupon.discount/100)*totalPrice).toLocaleString()}</span>
                    </div>
                )}
            </div>

            <div className='flex justify-between items-center border-t border-slate-100 pt-6 mb-6'>
                <span className="font-bold text-slate-800">Tổng thanh toán:</span>
                <span className='font-black text-2xl text-indigo-600'>
                    {currency}{coupon ? (totalPrice - ((coupon.discount/100)*totalPrice)).toLocaleString() : Number(totalPrice).toLocaleString()}
                </span>
            </div>
            
            <button
                onClick={handlePlaceOrder}
                disabled={loadingOrder}
                className='w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 active:scale-95 transition-all disabled:bg-indigo-300 shadow-lg shadow-indigo-100 text-sm'
            >
                {loadingOrder ? 'Đang xử lý...' : 'Xác nhận Đặt hàng'}
            </button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}
        </div>
    )
}
export default OrderSummary;
