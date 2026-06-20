'use client'
import { useState, useEffect } from 'react'
import { Package, ShoppingCart, Users, CheckCircle, Clock, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StaffDashboard() {
    const [stats, setStats] = useState({
        pendingProducts: 0,
        pendingOrders: 0,
        activeSellers: 0,
        todayOrders: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Giả lập dữ liệu thống kê cho nhân viên
                // Trong thực tế sẽ gọi API từ database
                setStats({
                    pendingProducts: 12,
                    pendingOrders: 8,
                    activeSellers: 45,
                    todayOrders: 25
                })
            } catch (error) {
                toast.error("Không thể tải thông tin thống kê")
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const statCards = [
        { title: 'Sản phẩm chờ duyệt', value: stats.pendingProducts, icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' },
        { title: 'Đơn hàng mới', value: stats.pendingOrders, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Người bán hoạt động', value: stats.activeSellers, icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
        { title: 'Đơn hàng hôm nay', value: stats.todayOrders, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-100' },
    ]

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Tổng quan công việc (Staff)</h1>
                    <p className="text-slate-500 text-sm">Chào mừng bạn trở lại! Dưới đây là tóm tắt tình hình vận hành hôm nay.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                    <BarChart3 size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">Tháng 6, 2024</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                            <card.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{card.title}</p>
                            <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Tasks */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Clock size={20} className="text-blue-500" />
                            Việc cần xử lý ngay
                        </h3>
                        <button className="text-blue-600 text-xs font-semibold hover:underline">Xem tất cả</button>
                    </div>
                    <div className="space-y-4">
                        {[
                            { task: "Duyệt sản phẩm: iPhone 15 Pro Max", time: "10 phút trước", type: "product", priority: "High" },
                            { task: "Đơn hàng #ORD-9921 cần xác nhận", time: "25 phút trước", type: "order", priority: "Medium" },
                            { task: "Hỗ trợ khách hàng: Lỗi thanh toán", time: "1 giờ trước", type: "support", priority: "Normal" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${item.priority === 'High' ? 'bg-red-500' : item.priority === 'Medium' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">{item.task}</p>
                                        <p className="text-xs text-slate-400">{item.time} • Ưu tiên: {item.priority}</p>
                                    </div>
                                </div>
                                <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:border-blue-500 hover:text-blue-600 transition">
                                    Xử lý
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Completed Activity */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <CheckCircle size={20} className="text-green-500" />
                        Đã hoàn thành gần đây
                    </h3>
                    <div className="space-y-4">
                        {[
                            { action: "Đã duyệt cửa hàng: TechZone", status: "Thành công", date: "Hôm nay, 09:30" },
                            { action: "Đã cập nhật trạng thái đơn #8821", status: "Đã giao", date: "Hôm nay, 08:15" },
                            { action: "Đã xóa sản phẩm vi phạm chính sách", status: "Hoàn tất", date: "Hôm qua, 17:00" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-3 border-l-4 border-green-500 bg-green-50/30 rounded-r-xl">
                                <div>
                                    <p className="text-sm font-medium text-slate-700">{item.action}</p>
                                    <p className="text-xs text-slate-500">{item.date} • <span className="text-green-600 font-semibold">{item.status}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
