'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";
import OrderItem from "@/components/OrderItem";
import { TicketPercent, Info, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [name, setName] = useState("");
    const [image, setImage] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const { ratings } = useSelector((state) => state.rating);

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            setName(session.user.name || "");
            setImage(session.user.image || "");
        }

        if (status === "unauthenticated") {
            router.push("/login?redirect=/profile");
        }
    }, [status, session, router]);

    useEffect(() => {
        const fetchOrdersAndCoupons = async () => {
            try {
                // 1. Lấy danh sách đơn hàng
                const ordersRes = await fetch('/api/orders');
                if (ordersRes.ok) {
                    const ordersData = await ordersRes.json();
                    setOrders(ordersData.data || []);
                }

                // 2. Lấy danh sách coupon thực tế từ API
                const couponsRes = await fetch('/api/coupons');
                if (couponsRes.ok) {
                    const couponsData = await couponsRes.json();
                    setCoupons(couponsData.data || []);
                }
            } catch (err) {
                console.error('Fetch profile data error:', err);
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
                body: JSON.stringify({ name, image, currentPassword, newPassword, confirmNewPassword }),
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

    if (status === "loading") {
        return (
            <main className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-pulse text-slate-400 font-medium">Đang tải thông tin...</div>
            </main>
        );
    }

    const totalOrders = orders.length;
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
                </div>
            </div>
        </main>
    );
}
