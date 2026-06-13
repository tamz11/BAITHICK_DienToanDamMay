'use client'
import Link from "next/link";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/features/auth/authSlice";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(login({ email }));
        router.push(redirect);
    };

    return (
        <main className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-slate-50 py-16">
            <div className="w-full max-w-md rounded-[2rem] bg-white p-10 shadow-xl">
                <h1 className="text-3xl font-semibold text-slate-800">Đăng nhập</h1>
                <p className="mt-3 text-sm text-slate-500">Nhập email và mật khẩu để tiếp tục.</p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                            placeholder="Nhập mật khẩu"
                        />
                    </label>

                    <button
                        type="submit"
                        className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                        Đăng nhập
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                    <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-700">
                        Chưa có tài khoản? Đăng ký
                    </Link>
                    <button type="button" className="font-medium text-slate-600 hover:text-slate-900">
                        Quên mật khẩu?
                    </button>
                </div>
            </div>
        </main>
    );
}
