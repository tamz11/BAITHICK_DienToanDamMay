'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterStaffPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (formData.password !== formData.confirmPassword) {
                throw new Error("Mật khẩu xác nhận không khớp");
            }
            if (formData.password.length < 6) {
                throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
            }

            const res = await fetch("/api/auth/register-staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Đăng ký thất bại");
            }

            toast.success("Đăng ký tài khoản nhân viên thành công!");
            router.push("/login");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-slate-800">
                        Đăng ký Nhân viên
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-500">
                        Hệ thống quản trị nội bộ <span className="text-blue-600 font-bold">go</span>cart Staff.
                    </p>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handleRegister}>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Họ và tên</label>
                            <input
                                type="text"
                                required
                                className="border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="Nguyễn Văn Staff"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Email công việc</label>
                            <input
                                type="email"
                                required
                                className="border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="staff@gocart.com"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Mật khẩu</label>
                            <input
                                type="password"
                                required
                                className="border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                required
                                className="border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition disabled:bg-slate-300 mt-4"
                    >
                        {loading ? "Đang xử lý..." : "Đăng ký tài khoản Staff"}
                    </button>
                </form>

                <div className="text-center text-sm text-slate-500 mt-4">
                    Đã có tài khoản?{" "}
                    <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                        Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}
