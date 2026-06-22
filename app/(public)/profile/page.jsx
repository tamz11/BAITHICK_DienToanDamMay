"use client"

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";
import OrderItem from "@/components/OrderItem";
<<<<<<< HEAD
import { TicketPercent, Info, CheckCircle2 } from "lucide-react";
=======
import AddressModal from '@/components/AddressModal'
import { couponDummyData } from "@/assets/assets";
>>>>>>> main

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [name, setName] = useState("");
    const [image, setImage] = useState("");
    const [phone, setPhone] = useState("");
    const [ewallet, setEwallet] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const { ratings } = useSelector((state) => state.rating || { ratings: [] });
    const addressDefaultId = useSelector((state) => state.address?.defaultId)
    const [activeTab, setActiveTab] = useState('info');
    const fileInputRef = useRef(null);
    const dispatch = useDispatch();

    const [addrName, setAddrName] = useState('');
    const [addrStreet, setAddrStreet] = useState('');
    const [addrCity, setAddrCity] = useState('');
    const [addrStateVal, setAddrStateVal] = useState('');
    const [addrZip, setAddrZip] = useState('');
    const [addresses, setAddresses] = useState([]);
    const [showAddressModal, setShowAddressModal] = useState(false);

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            setName(session.user.name || "");
            setImage(session.user.image || "");
        }

        if (status === "unauthenticated") {
            router.push("/login?redirect=/profile");
        }
    }, [status, session, router]);

<<<<<<< HEAD
    useEffect(() => {
        const fetchOrdersAndCoupons = async () => {
            try {
                // 1. Lấy danh sách đơn hàng
=======
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/profile')
                if (!res.ok) return
                const data = await res.json()
                if (data.user) {
                    setName(data.user.name || '');
                    setImage(data.user.image || '');
                    setPhone(data.user.phone || '');
                    setEwallet(data.user.ewallet || '');
                }
            } catch (e) {
                // ignore
            }
        }

        if (status === 'authenticated') fetchProfile()
    }, [status])

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await fetch('/api/addresses')
                if (!res.ok) return
                const data = await res.json()
                setAddresses(data.addresses || [])
                // update redux so OrderSummary can use addresses
                if (data.addresses && data.addresses.length > 0) {
                    dispatch({ type: 'address/setAddresses', payload: data.addresses })
                }
            } catch (e) {
                // ignore
            }
        }

        if (status === 'authenticated') fetchAddresses()
    }, [status, showAddressModal])

    const Addresses = useCallback(() => {
        if (!addresses || addresses.length === 0) return <p className="text-sm text-slate-400">Chưa có địa chỉ nào.</p>
        return (
            <div className="flex flex-col gap-2">
                {addresses.map((a, idx) => (
                    <div key={a.id} className="p-2 border rounded text-sm text-slate-700 flex justify-between items-center">
                        <div>
                            <div className="font-medium">{a.name} {a.phone ? `· ${a.phone}` : ''}</div>
                            <div className="text-xs text-slate-500">{a.street}, {a.city}, {a.state} {a.zip}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <button onClick={async () => {
                                try {
                                    const res = await fetch('/api/addresses/default', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ addressId: a.id }) })
                                    if (!res.ok) throw new Error('Không thể đặt mặc định')
                                    dispatch({ type: 'address/setDefaultAddress', payload: a.id })
                                    toast.success('Cập nhật địa chỉ mặc định')
                                } catch (err) {
                                    console.error('Set default error:', err)
                                    toast.error(err.message || 'Lỗi')
                                }
                            }} className="text-xs rounded px-3 py-1 bg-indigo-600 text-white">Đặt làm mặc định</button>
                            {String(addressDefaultId) === String(a.id) ? <span className="text-[11px] text-slate-400">Mặc định</span> : null}
                        </div>
                    </div>
                ))}
            </div>
        )
    }, [addresses, dispatch, addressDefaultId])

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const res = await fetch('/api/store/me')
                if (!res.ok) return
                const data = await res.json()
                if (data.store) {
                    if (data.store.status === 'pending') {
                        toast('Bạn đã đăng ký làm cửa hàng. Đang chờ admin xét duyệt.', { icon: 'ℹ️' })
                    } else if (!data.store.isActive) {
                        toast('Hồ sơ cửa hàng chưa hoạt động.', { icon: 'ℹ️' })
                    }
                }
            } catch (e) {
                // ignore
            }
        }

        if (status === 'authenticated') fetchStore()
    }, [status])

    useEffect(() => {
        const fetchOrdersAndCoupons = async () => {
            try {
>>>>>>> main
                const ordersRes = await fetch('/api/orders');
                if (ordersRes.ok) {
                    const ordersData = await ordersRes.json();
                    setOrders(ordersData.data || []);
                }

<<<<<<< HEAD
                // 2. Lấy danh sách coupon thực tế từ API
                const couponsRes = await fetch('/api/coupons');
                if (couponsRes.ok) {
                    const couponsData = await couponsRes.json();
                    setCoupons(couponsData.data || []);
                }
            } catch (err) {
                console.error('Fetch profile data error:', err);
=======
            // Fetch available coupons from API
            try {
                const couponsRes = await fetch('/api/coupons');
                if (couponsRes.ok) {
                    const data = await couponsRes.json();
                    setCoupons((data.coupons || []).filter((c) => new Date(c.expiresAt) > new Date()));
                } else {
                    // fallback to dummy if API fails
                    setCoupons(couponDummyData.filter((coupon) => new Date(coupon.expiresAt) > new Date()));
                }
            } catch (e) {
                setCoupons(couponDummyData.filter((coupon) => new Date(coupon.expiresAt) > new Date()));
>>>>>>> main
            }
        };

        if (status === 'authenticated') {
            fetchOrdersAndCoupons();
        }
    }, [status]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
<<<<<<< HEAD
                body: JSON.stringify({ name, image, currentPassword, newPassword, confirmNewPassword }),
=======
                body: JSON.stringify({
                    name,
                    image,
                    phone,
                    ewallet,
                    currentPassword,
                    newPassword,
                    confirmNewPassword,
                }),
>>>>>>> main
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Cập nhật thất bại");

            toast.success("Cập nhật thông tin thành công");
            setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword("");
        } catch (err) {
            toast.error(err.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: addrName,
                    street: addrStreet,
                    city: addrCity,
                    state: addrStateVal,
                    zip: addrZip,
                    country: 'VN',
                    phone: phone || ''
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Lỗi thêm địa chỉ')

            // dispatch to redux so OrderSummary can pick it up
            dispatch({ type: 'address/addAddress', payload: data.address })
            toast.success('Đã thêm địa chỉ')
            setAddrName('')
            setAddrStreet('')
            setAddrCity('')
            setAddrStateVal('')
            setAddrZip('')
        } catch (err) {
            console.error('Add address error:', err)
            toast.error(err.message || 'Lỗi thêm địa chỉ')
        }
    }

    if (status === "loading") {
        return (
            <main className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-pulse text-slate-400 font-medium">Đang tải thông tin...</div>
            </main>
        );
    }

    const totalOrders = orders.length;
<<<<<<< HEAD
    const deliveredOrders = orders.filter((order) => order.status === "DELIVERED").length;
    const activeCoupons = coupons.filter(c => c.isEligible).length;

    return (
        <main className="min-h-[calc(100vh-6rem)] bg-slate-50 py-16">
            <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
                <div className="rounded-[2.5rem] bg-white p-10 shadow-2xl shadow-slate-200/50">
                    <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-50 pb-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Hồ sơ cá nhân</h1>
                            <p className="mt-1 text-sm text-slate-400 font-medium">Quản lý tài khoản, lịch sử mua hàng và ưu đãi của bạn.</p>
                        </div>
                        <Link href="/" className="inline-flex items-center rounded-2xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                            Tiếp tục mua sắm
                        </Link>
                    </div>

                    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email tài khoản</label>
                                    <input type="email" value={session?.user?.email || ""} disabled className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5 text-sm text-slate-400 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ảnh đại diện (URL)</label>
                                <input type="url" value={image} onChange={(e) => setImage(e.target.value)} disabled={loading} className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50" placeholder="https://..." />
                            </div>

                            <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6 space-y-6">
                                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Đổi mật khẩu bảo mật</p>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={loading} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-indigo-500" placeholder="Mật khẩu cũ" />
                                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loading} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-indigo-500" placeholder="Mật khẩu mới" />
                                    <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} disabled={loading} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-indigo-500" placeholder="Xác nhận lại" />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full rounded-2xl bg-slate-800 py-4 text-sm font-bold text-white transition hover:bg-slate-900 shadow-xl disabled:bg-slate-300 active:scale-[0.98]">
                                {loading ? "Đang xử lý..." : "Lưu thay đổi hồ sơ"}
                            </button>
                        </form>

                        <div className="grid grid-cols-2 gap-4 h-fit">
                            {[
                                { label: "Tổng đơn hàng", val: totalOrders, sub: "Đã đặt", color: "text-blue-600" },
                                { label: "Giao thành công", val: deliveredOrders, sub: "Đã nhận", color: "text-emerald-600" },
                                { label: "Hạng thành viên", val: totalOrders >= 3 ? "Member" : "Newbie", sub: totalOrders >= 3 ? "Ưu đãi Vàng" : "Khách mới", color: "text-indigo-600" },
                                { label: "Ưu đãi khả dụng", val: activeCoupons, sub: "Mã giảm giá", color: "text-rose-600" },
                            ].map((stat, i) => (
                                <div key={i} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                    <p className={`mt-2 text-3xl font-black ${stat.color}`}>{stat.val}</p>
                                    <p className="mt-1 text-[10px] text-slate-500 font-medium italic">{stat.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
                    <div className="rounded-[2.5rem] bg-white p-10 shadow-2xl shadow-slate-200/50">
                        <PageTitle heading="Lịch sử đơn hàng" text={`Bạn đã thực hiện ${totalOrders} giao dịch trên GoCart.`} linkText="Xem sản phẩm" />

                        {orders.length > 0 ? (
                            <div className="overflow-x-auto mt-8">
                                <table className="w-full min-w-[720px] text-left text-sm">
                                    <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <tr className="border-b border-slate-100">
                                            <th className="py-4 px-4">Sản phẩm</th>
                                            <th className="py-4 px-4">Thanh toán</th>
                                            <th className="py-4 px-4">Giao tới</th>
                                            <th className="py-4 px-4">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {orders.map((order) => (
                                            <OrderItem order={order} key={order.id} onConfirm={() => window.location.reload()} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <div className="text-slate-200 mb-4 flex justify-center"><TicketPercent size={64} /></div>
                                <h2 className="text-lg font-bold text-slate-400">Bạn chưa có đơn hàng nào</h2>
                            </div>
                        )}
                    </div>

                    <aside className="space-y-8">
                        <div className="rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-slate-200/50">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <TicketPercent className="text-rose-500" size={20} /> Ưu đãi dành cho bạn
                            </h2>
                            <p className="mt-1 text-xs text-slate-400">Mã giảm giá thực tế từ hệ thống.</p>

                            <div className="mt-6 space-y-4">
                                {coupons.length > 0 ? (
                                    coupons.map((coupon) => (
                                        <div key={coupon.code} className={`group relative rounded-3xl border p-5 transition-all ${coupon.isEligible ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className={`font-black uppercase tracking-tighter ${coupon.isEligible ? 'text-indigo-600 text-lg' : 'text-slate-400'}`}>{coupon.code}</p>
                                                    <p className="text-[11px] font-bold text-slate-600 mt-1">{coupon.description}</p>
                                                </div>
                                                {coupon.isEligible ? (
                                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                                ) : (
                                                    <Info size={16} className="text-slate-300" />
                                                )}
                                            </div>
                                            <div className="mt-4 flex items-center justify-between border-t border-white/50 pt-3">
                                                <span className="text-[10px] font-bold text-rose-500">GIẢM {coupon.discount}%</span>
                                                <span className="text-[9px] text-slate-400 font-medium">Hết hạn: {new Date(coupon.expiresAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            {!coupon.isEligible && (
                                                <div className="mt-2 text-[9px] text-rose-400 font-bold italic">* Bạn chưa đủ điều kiện dùng mã này</div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-slate-400 text-xs italic">Hiện không có mã giảm giá nào.</div>
                                )}
                            </div>
                        </div>
                    </aside>
=======
    const deliveredOrders = orders.filter((order) => order.status && order.status.toLowerCase().includes("deliver")).length;
    const pendingOrders = orders.filter((order) => !(order.status && order.status.toLowerCase().includes("deliver"))).length;
    const couponOrders = orders.filter((order) => order.isCouponUsed).length;
    const activeCoupons = coupons.length;

    return (
        <main className="min-h-[calc(100vh-6rem)] bg-slate-50 py-16">
            <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
                <div className="rounded-[2rem] bg-white p-6 shadow-xl">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-800">Trang cá nhân</h1>
                            <p className="mt-1 text-sm text-slate-500">Quản lý thông tin tài khoản, đơn hàng và đánh giá.</p>
                        </div>
                        <Link href="/" className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
                            Về trang chủ
                        </Link>
                    </div>

                    <nav className="mb-6 flex flex-wrap items-center gap-2">
                        {[
                            { key: 'info', label: 'Thông tin' },
                            { key: 'orders', label: 'Đơn hàng' },
                            { key: 'coupons', label: 'Mã giảm giá' },
                            { key: 'reviews', label: 'Đánh giá' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${activeTab === tab.key ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    <div>
                        {activeTab === 'info' && (
                            <div className="space-y-6">
                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                    <div className="flex flex-col items-center gap-4 mb-4">
                                        <div className="relative">
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="group relative">
                                                {image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={image} alt="avatar" className="w-28 h-28 rounded-full object-cover border border-slate-200 cursor-pointer" />
                                                ) : (
                                                    <div className="w-28 h-28 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 cursor-pointer">No image</div>
                                                )}
                                                <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition">
                                                    <span className="mb-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">Chỉnh sửa</span>
                                                </div>
                                            </button>
                                            <input ref={fileInputRef} type="file" accept="image/*" onChange={async (e) => {
                                                const file = e.target.files?.[0]
                                                if (!file) return
                                                const form = new FormData()
                                                form.append('file', file)
                                                try {
                                                    const res = await fetch('/api/upload/logo', { method: 'POST', body: form })
                                                    const data = await res.json()
                                                    if (res.ok && data.url) {
                                                        // first set preview
                                                        setImage(data.url)
                                                        // persist image to profile so it doesn't disappear
                                                        const saveRes = await fetch('/api/profile', {
                                                            method: 'PATCH',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ image: data.url }),
                                                        })
                                                        const saveData = await saveRes.json()
                                                        if (!saveRes.ok) {
                                                            throw new Error(saveData.error || 'Không lưu ảnh được')
                                                        }
                                                        toast.success('Tải ảnh lên thành công')
                                                    } else {
                                                        throw new Error(data.error || 'Upload thất bại')
                                                    }
                                                } catch (err) {
                                                    console.error('Upload error:', err)
                                                    toast.error(err.message || 'Lỗi tải ảnh')
                                                }
                                            }} className="hidden" />
                                        </div>
                                    </div>

                                    <p className="mb-4 text-sm font-semibold text-slate-700">Thông tin tài khoản</p>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <label className="block text-sm font-medium text-slate-700">
                                                Email
                                                <input
                                                    type="email"
                                                    value={session?.user?.email || ""}
                                                    disabled
                                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none"
                                                />
                                            </label>

                                            <label className="block text-sm font-medium text-slate-700">
                                                Họ và tên
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    required
                                                    disabled={loading}
                                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                                                    placeholder="Nguyễn Văn A"
                                                />
                                            </label>
                                        </div>

                                        <div className="rounded-3xl border border-slate-200 bg-white p-6">
                                            <p className="mb-4 text-sm font-semibold text-slate-700">Đổi mật khẩu</p>
                                            <div className="grid gap-6 sm:grid-cols-3">
                                                <label className="block text-sm font-medium text-slate-700">
                                                    Mật khẩu hiện tại
                                                    <input
                                                        type="password"
                                                        value={currentPassword}
                                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                                        disabled={loading}
                                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                                                        placeholder="Nhập mật khẩu hiện tại"
                                                    />
                                                </label>
                                                <label className="block text-sm font-medium text-slate-700">
                                                    Mật khẩu mới
                                                    <input
                                                        type="password"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        disabled={loading}
                                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                                                        placeholder="Tạo mật khẩu mới"
                                                    />
                                                </label>
                                                <label className="block text-sm font-medium text-slate-700">
                                                    Xác nhận mật khẩu
                                                    <input
                                                        type="password"
                                                        value={confirmNewPassword}
                                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                        disabled={loading}
                                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                                                        placeholder="Nhập lại mật khẩu mới"
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <label className="block text-sm font-medium text-slate-700">
                                                Số điện thoại
                                                <input
                                                    type="text"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    disabled={loading}
                                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                                                    placeholder="09xxxxxxxx"
                                                />
                                            </label>

                                            <label className="block text-sm font-medium text-slate-700">
                                                Số điện thoại ví (ví điện tử)
                                                <input
                                                    type="text"
                                                    value={ewallet}
                                                    onChange={(e) => setEwallet(e.target.value)}
                                                    disabled={loading}
                                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                                                    placeholder="Số điện thoại ví (ví MoMo/ZaloPay...)"
                                                />
                                            </label>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                            <p className="mb-2 text-sm font-medium text-slate-700">Địa chỉ của bạn</p>
                                            <Addresses />
                                            <div className="mt-3">
                                                <button onClick={() => setShowAddressModal(true)} className="rounded-2xl bg-green-600 px-4 py-2 text-white text-sm">Thêm địa chỉ mới</button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:bg-indigo-400"
                                        >
                                            {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="rounded-[1rem] bg-white p-6">
                                <PageTitle
                                    heading="Lịch sử đơn hàng"
                                    text={`Bạn có ${totalOrders} đơn hàng. Xem chi tiết trạng thái, mã giảm giá và đánh giá.`}
                                    linkText="Xem sản phẩm"
                                />

                                {orders.length > 0 ? (
                                    <div className="overflow-x-auto mt-6">
                                        <table className="w-full min-w-[720px] text-left text-sm text-slate-500">
                                            <thead>
                                                <tr className="border-b border-slate-200 text-slate-600">
                                                    <th className="py-4 px-4">Sản phẩm</th>
                                                    <th className="py-4 px-4">Tổng giá</th>
                                                    <th className="py-4 px-4">Địa chỉ</th>
                                                    <th className="py-4 px-4">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {orders.map((order) => (
                                                    <OrderItem order={order} key={order.id} />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="min-h-[20rem] flex items-center justify-center text-slate-400">
                                        <h2 className="text-xl font-semibold">Bạn chưa có đơn hàng nào</h2>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'coupons' && (
                            <div className="rounded-[1rem] bg-white p-6">
                                <h2 className="text-xl font-semibold text-slate-800">Ưu đãi hiện có</h2>
                                <p className="mt-2 text-sm text-slate-500">Mã giảm giá đang còn hiệu lực.</p>
                                <div className="mt-6 space-y-3">
                                    {activeCoupons > 0 ? (
                                        coupons.map((coupon) => (
                                                <div key={coupon.code} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{coupon.code}</p>
                                                        <p className="text-sm text-slate-600">{coupon.description}</p>
                                                        <p className="mt-2 text-sm text-slate-500">Giảm {coupon.discount}% - Hết hạn {new Date(coupon.expiresAt).toLocaleDateString('vi-VN')}</p>
                                                    </div>
                                                    <div>
                                                        <button onClick={() => { localStorage.setItem('appliedCoupon', coupon.code); router.push('/cart'); }} className="rounded-md bg-indigo-600 text-white px-3 py-2 text-sm">Áp dụng</button>
                                                    </div>
                                                </div>
                                        ))
                                    ) : (
                                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Không có mã giảm giá mới.</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="rounded-[1rem] bg-white p-6">
                                <h2 className="text-xl font-semibold text-slate-800">Đánh giá sản phẩm</h2>
                                <p className="mt-2 text-sm text-slate-500">Xem lại những sản phẩm bạn đã đánh giá.</p>
                                {ratings && ratings.length > 0 ? (
                                    <div className="mt-6 space-y-4">
                                        {ratings.map((item) => (
                                            <div key={`${item.orderId}-${item.productId}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                                <p className="font-semibold text-slate-800">{item.product?.name || item.productId}</p>
                                                <p className="text-sm text-slate-500">{item.review || 'Không có nhận xét'}</p>
                                                <div className="mt-2 flex items-center gap-1 text-green-600">
                                                    {Array.from({ length: 5 }, (_, index) => (
                                                        <span key={index} className={item.rating > index ? 'font-bold' : 'text-slate-300'}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Bạn chưa đánh giá sản phẩm nào.</div>
                                )}
                            </div>
                        )}
                    </div>
>>>>>>> main
                </div>
            </div>
            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}
        </main>
    );
}
