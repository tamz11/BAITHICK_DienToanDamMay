'use client'
import { useState, useEffect } from 'react'
import { Package, ShoppingCart, Users, CheckCircle, Clock, BarChart3, ArrowRight, User, Phone, MapPin, ListOrdered } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function StaffDashboard() {
    const [data, setData] = useState({
        stats: {
            pendingProducts: 0,
            pendingOrders: 0,
            activeSellers: 0,
            todayOrders: 0
        },
        pendingProducts: [],
        pendingOrders: [],
        recentActivity: []
    })
    const [loading, setLoading] = useState(true)

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/staff/stats')
            const result = await res.json()
            if (res.ok) {
                setData({
                    stats: result.stats,
                    pendingProducts: result.pendingProducts || [],
                    pendingOrders: result.pendingOrders || [],
                    recentActivity: result.recentActivity || []
                })
            } else {
                toast.error(result.error || "Không thể tải dữ liệu")
            }
        } catch (error) {
            console.error("Dashboard fetch error:", error)
            toast.error("Lỗi kết nối máy chủ")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const statCards = [
        { title: 'Sản phẩm chờ duyệt', value: data.stats.pendingProducts, icon: Package, color: 'text-orange-600', bg: 'bg-orange-100', link: '/staff/products' },
        { title: 'Đơn hàng mới', value: data.stats.pendingOrders, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', link: '/staff/orders' },
        { title: 'Người bán hoạt động', value: data.stats.activeSellers, icon: Users, color: 'text-green-600', bg: 'bg-green-100', link: '/staff' },
        { title: 'Đơn hàng hôm nay', value: data.stats.todayOrders, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-100', link: '/staff/orders' },
    ]

    return (
        <div className="space-y-8 animate-fadeIn pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Tổng quan công việc (Staff)</h1>
                    <p className="text-slate-500 text-sm">Dữ liệu vận hành hệ thống được cập nhật theo thời gian thực.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                    <BarChart3 size={18} className="text-blue-500" />
                    <span className="text-sm font-bold text-slate-600">Tháng {new Date().getMonth() + 1}, {new Date().getFullYear()}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <Link href={card.link} key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-blue-200 transition-all group">
                        <div className={`p-3 rounded-xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                            <card.icon size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
                            <p className="text-2xl font-black text-slate-800">{loading ? '...' : card.value}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* 📋 ĐƠN HÀNG MỚI CẦN XỬ LÝ - CHI TIẾT NHƯ BẠN MUỐN */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                                <ShoppingCart size={22} className="text-blue-500" />
                                Đơn hàng mới chờ xác nhận
                            </h3>
                            <Link href="/staff/orders" className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1">
                                Quản lý tất cả <ArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-10 text-slate-400 text-xs">Đang tải đơn hàng...</div>
                            ) : data.pendingOrders.length > 0 ? (
                                data.pendingOrders.map((order) => (
                                    <div key={order.id} className="p-5 bg-slate-50/50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                            {/* Info Khách hàng & Địa chỉ */}
                                            <div className="space-y-3 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">#{order.id.slice(-6).toUpperCase()}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium italic">{new Date(order.createdAt).toLocaleString()}</span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="flex items-start gap-2">
                                                        <User size={14} className="text-slate-400 mt-0.5" />
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-700">{order.user?.name}</p>
                                                            <p className="text-[10px] text-slate-400">{order.user?.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <Phone size={14} className="text-slate-400 mt-0.5" />
                                                        <p className="text-xs font-bold text-slate-700">{order.address?.phone || "Chưa có SĐT"}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2 bg-white/50 p-2 rounded-xl border border-slate-50">
                                                    <MapPin size={14} className="text-rose-400 mt-0.5" />
                                                    <p className="text-[11px] text-slate-500 leading-relaxed">
                                                        {order.address?.street}, {order.address?.city}, {order.address?.state}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Sản phẩm & Số lượng */}
                                            <div className="bg-white p-3 rounded-2xl border border-slate-100 min-w-[240px]">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                    <ListOrdered size={12} /> Sản phẩm đặt mua
                                                </p>
                                                <div className="space-y-2">
                                                    {order.orderItems.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center gap-4 border-b border-slate-50 pb-1 last:border-0">
                                                            <p className="text-xs font-medium text-slate-600 truncate flex-1">{item.product.name}</p>
                                                            <span className="text-xs font-black text-indigo-600">x{item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-slate-400">TỔNG CỘNG:</span>
                                                    <span className="text-sm font-black text-slate-800">${order.total.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-end">
                                            <Link href="/staff/orders" className="bg-slate-800 text-white text-[10px] font-bold px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors shadow-sm">
                                                XỬ LÝ NGAY
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 text-slate-300 italic border-2 border-dashed border-slate-50 rounded-3xl">
                                    Không có đơn hàng mới nào cần xử lý.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 📦 BÊN PHẢI: SẢN PHẨM CHỜ DUYỆT */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Package size={20} className="text-orange-500" />
                                Sản phẩm chờ duyệt
                            </h3>
                            <Link href="/staff/products" className="text-blue-600 text-[10px] font-bold hover:underline">Tất cả</Link>
                        </div>
                        <div className="space-y-3">
                            {data.pendingProducts.length > 0 ? (
                                data.pendingProducts.map((item, i) => (
                                    <div key={i} className="p-4 bg-orange-50/30 border border-orange-100 rounded-2xl flex justify-between items-center">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-slate-700 truncate">{item.name}</p>
                                            <p className="text-[9px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <Link href="/staff/products" className="text-[9px] font-black text-orange-600 hover:underline">DUYỆT</Link>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-slate-400 text-[10px] italic">Đã duyệt hết sản phẩm.</div>
                            )}
                        </div>
                    </div>

                    {/* HOẠT ĐỘNG GẦN ĐÂY */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <CheckCircle size={20} className="text-emerald-500" />
                            Vừa cập nhật
                        </h3>
                        <div className="space-y-4">
                            {data.recentActivity.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                    <div className="size-2 rounded-full bg-emerald-500"></div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-bold text-slate-700 truncate">Đơn #{item.id.slice(-6).toUpperCase()}</p>
                                        <p className="text-[9px] text-slate-400 uppercase font-black">{item.status.replace(/_/g, ' ')}</p>
                                    </div>
                                    <p className="text-[9px] text-slate-300 italic">{new Date(item.updatedAt).toLocaleTimeString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
