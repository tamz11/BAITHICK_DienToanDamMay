'use client'
import Link from "next/link";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { login } from "@/lib/features/auth/authSlice";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const dispatch = useDispatch();
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            window.alert('Mật khẩu xác nhận không khớp');
            return;
        }
        dispatch(login({ name, email }));
        router.push('/');
    };

    return (
        <main className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-slate-50 py-16">
            <div className="w-full max-w-md rounded-[2rem] bg-white p-10 shadow-xl">
                <h1 className="text-3xl font-semibold text-slate-800">Đăng ký</h1>
                <p className="mt-3 text-sm text-slate-500">Tạo tài khoản mới để bắt đầu bán hàng hoặc mua sắm.</p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <label className="block text-sm font-medium text-slate-700">
                        Họ và tên
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            placeholder="Nguyễn Văn A"
                        />
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            placeholder="you@example.com"
                        />
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                        Mật khẩu
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            placeholder="Tạo mật khẩu"
                        />
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                        Xác nhận mật khẩu
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            placeholder="Nhập lại mật khẩu"
                        />
                    </label>

                    <button
                        type="submit"
                        className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                        Đăng ký
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </main>
    );
}
