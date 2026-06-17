'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterSellerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        storeName: ""
    });

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register-seller", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Đăng ký thất bại");
            }

            toast.success("Đăng ký đối tác thành công! Hãy đăng nhập.");
            router.push("/login"); // Đẩy về trang đăng nhập chung
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xs">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-slate-800">
                        Đăng ký Kênh Người Bán
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-500">
                        Bắt đầu kinh doanh cùng <span className="text-green-600 font-bold">go</span>cart.
                    </p>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handleRegister}>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-600">Tên người đại diện</label>
                        <input type="text" required className="border border-slate-200 p-3 rounded-xl outline-none" placeholder="Nguyễn Văn A" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-600">Tên Cửa hàng / Thương hiệu</label>
                        <input type="text" required className="border border-slate-200 p-3 rounded-xl outline-none" placeholder="Peony Memories Electronics" value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-600">Email đăng ký</label>
                        <input type="email" required className="border border-slate-200 p-3 rounded-xl outline-none" placeholder="store@gmail.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-600">Mật khẩu</label>
                        <input type="password" required className="border border-slate-200 p-3 rounded-xl outline-none" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition disabled:bg-slate-300">
                        {loading ? "Đang xử lý khởi tạo hệ thống..." : "Đăng ký mở cửa hàng"}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-4">
                    Bạn đã có tài khoản cửa hàng?{" "}
                    <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                        Đăng nhập ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}