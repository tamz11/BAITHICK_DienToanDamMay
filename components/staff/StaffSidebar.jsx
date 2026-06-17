'use client'
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, MessageSquare, Truck, LogOut } from "lucide-react"
import Link from "next/link"
import { signOut } from "next-auth/react"

const StaffSidebar = () => {
    const pathname = usePathname()

    const links = [
        { name: 'Dashboard', href: '/staff', icon: LayoutDashboard },
        { name: 'Duyệt Sản phẩm', href: '/staff/products', icon: Package },
        { name: 'Đơn hàng', href: '/staff/orders', icon: ShoppingCart },
        { name: 'Vận chuyển', href: '/staff/shipping', icon: Truck },
        { name: 'Hỗ trợ khách', href: '/staff/support', icon: MessageSquare },
    ]

    return (
        <div className="flex flex-col h-full w-64 border-r border-slate-200 bg-white">
            <div className="flex-1 py-6">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                            pathname === link.href
                            ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <link.icon size={20} />
                        {link.name}
                    </Link>
                ))}
            </div>

            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                    <LogOut size={20} />
                    Đăng xuất
                </button>
            </div>
        </div>
    )
}

export default StaffSidebar
