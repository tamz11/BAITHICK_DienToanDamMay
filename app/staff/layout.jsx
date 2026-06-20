'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Loading from "@/components/Loading"
import StaffSidebar from "@/components/staff/StaffSidebar"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

export default function StaffLayout({ children }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === 'loading') return
        // In a real scenario, you might want to redirect if not staff
        // But for now, we'll just show the unauthorized state if they aren't staff
        setLoading(false)
    }, [session, status])

    if (status === 'loading' || loading) return <Loading />

    if (!session || session.user.role !== 'STAFF') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">Bạn không có quyền truy cập trang dành cho nhân viên</h1>
                <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 mt-8 p-2 px-6 max-sm:text-sm rounded-full">
                    Quay lại trang chủ <ArrowRightIcon size={18} />
                </Link>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <StaffSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
                    <h2 className="text-lg font-semibold text-slate-800">Staff Control Panel</h2>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-medium text-slate-700">{session.user.name}</p>
                            <p className="text-xs text-slate-500">Nhân viên hệ thống</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {session.user.name?.[0].toUpperCase()}
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
