'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";
import OrderItem from "@/components/OrderItem";
import { couponDummyData } from "@/assets/assets";

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
            const fetchStore = async () => {
                try {
                    const res = await fetch('/api/store/me')
                    if (!res.ok) return
                    const data = await res.json()
                    if (data.store) {
                        // show small banner if application pending
                        // no need to set state beyond showing message
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
                // Fetch orders from API
                const ordersRes = await fetch('/api/orders');
                if (ordersRes.ok) {
                    const ordersData = await ordersRes.json();
                    setOrders(ordersData.data || []);
                }
            } catch (err) {
                console.error('Fetch orders error:', err);
            }

            // Fetch coupons (still using dummy data for now)
            setCoupons(couponDummyData.filter((coupon) => new Date(coupon.expiresAt) > new Date()));
        };

        if (status === 'authenticated') {
            fetchOrdersAndCoupons();
        }
    }, [status]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (newPassword || confirmNewPassword) {
                if (!currentPassword) {
                    throw new Error("Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu");
                }
                if (newPassword !== confirmNewPassword) {
                    throw new Error("Mật khẩu mới và xác nhận không khớp");
                }
                if (newPassword.length < 6) {
                    throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
                }
            }

            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    image,
                    currentPassword,
                    newPassword,
                    confirmNewPassword,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Cập nhật thất bại");
            }

            toast.success("Cập nhật thông tin thành công");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (err) {
            toast.error(err.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <main className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-slate-50 py-16">
                <div className="rounded-3xl bg-white p-10 shadow-xl text-center text-slate-700">Đang tải thông tin...</div>
            </main>
        );
    }

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter((order) => order.status.toLowerCase().includes("deliver")).length;
    const pendingOrders = orders.filter((order) => !order.status.toLowerCase().includes("deliver")).length;
    const couponOrders = orders.filter((order) => order.isCouponUsed).length;
    const activeCoupons = coupons.length;

    return (
        <main className="min-h-[calc(100vh-6rem)] bg-slate-50 py-16">
            <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
                <div className="rounded-[2rem] bg-white p-10 shadow-xl">
                    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold text-slate-800">Trang cá nhân</h1>
                            <p className="mt-2 text-sm text-slate-500">Cập nhật thông tin tài khoản và xem lịch sử mua hàng, mã giảm giá và đánh giá.</p>
                        </div>
                        <Link href="/" className="inline-flex items-center rounded-full bg-slate-100 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
                            Về trang chủ
                        </Link>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-6">
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
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

                                    <label className="block text-sm font-medium text-slate-700">
                                        Ảnh đại diện (URL)
                                        <input
                                            type="url"
                                            value={image}
                                            onChange={(e) => setImage(e.target.value)}
                                            disabled={loading}
                                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                                            placeholder="https://example.com/avatar.jpg"
                                        />
                                    </label>

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

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <p className="text-sm font-semibold text-slate-700">Lịch sử mua hàng</p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">{totalOrders}</p>
                                <p className="mt-2 text-sm text-slate-500">Tổng số đơn đã đặt</p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <p className="text-sm font-semibold text-slate-700">Đơn đã giao</p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">{deliveredOrders}</p>
                                <p className="mt-2 text-sm text-slate-500">Giao thành công</p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <p className="text-sm font-semibold text-slate-700">Đơn đang xử lý</p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">{pendingOrders}</p>
                                <p className="mt-2 text-sm text-slate-500">Chờ cập nhật</p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <p className="text-sm font-semibold text-slate-700">Mã giảm giá</p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">{couponOrders}</p>
                                <p className="mt-2 text-sm text-slate-500">Đơn đã dùng mã</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
                    <div className="rounded-[2rem] bg-white p-10 shadow-xl">
                        <PageTitle
                            heading="Lịch sử đơn hàng"
                            text={`Bạn có ${totalOrders} đơn hàng. Xem chi tiết trạng thái, mã giảm giá và đánh giá.`}
                            linkText="Xem sản phẩm"
                        />

                        {orders.length > 0 ? (
                            <div className="overflow-x-auto">
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

                    <aside className="space-y-6">
                        <div className="rounded-[2rem] bg-white p-8 shadow-xl">
                            <h2 className="text-xl font-semibold text-slate-800">Ưu đãi hiện có</h2>
                            <p className="mt-2 text-sm text-slate-500">Mã giảm giá đang còn hiệu lực.</p>
                            <div className="mt-6 space-y-3">
                                {activeCoupons > 0 ? (
                                    coupons.map((coupon) => (
                                        <div key={coupon.code} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="font-semibold text-slate-800">{coupon.code}</p>
                                            <p className="text-sm text-slate-600">{coupon.description}</p>
                                            <p className="mt-2 text-sm text-slate-500">Giảm {coupon.discount}% - Hết hạn {new Date(coupon.expiresAt).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Không có mã giảm giá mới.</div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-[2rem] bg-white p-8 shadow-xl">
                            <h2 className="text-xl font-semibold text-slate-800">Đánh giá sản phẩm</h2>
                            <p className="mt-2 text-sm text-slate-500">Xem lại những sản phẩm bạn đã đánh giá.</p>
                            {ratings.length > 0 ? (
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
                    </aside>
                </div>
            </div>
        </main>
    );
}
