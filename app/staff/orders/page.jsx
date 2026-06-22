'use client'
import { useState, useEffect } from 'react'
import { Search, Filter, CheckCircle, Truck, Package, XCircle, Clock, ShoppingCart, User, MapPin, Phone, ListOrdered } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StaffOrdersPage() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/staff/orders')
            const data = await res.json()
            if (res.ok) {
                setOrders(data.data)
            } else {
                toast.error(data.error || "Không thể tải danh sách đơn hàng")
            }
        } catch (error) {
            console.error("Lỗi fetch orders:", error)
            toast.error("Lỗi kết nối máy chủ")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch(`/api/staff/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success("Cập nhật trạng thái thành công!")
                fetchOrders() // Refresh list
            } else {
                toast.error(data.error || "Cập nhật thất bại")
            }
        } catch (error) {
            toast.error("Lỗi kết nối")
        }
    }

    const filteredOrders = orders.filter(order => {
        const orderIdMatch = order.id.toLowerCase().includes(searchTerm.toLowerCase())
        const customerMatch = order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSearch = orderIdMatch || customerMatch
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'ORDER_PLACED': return 'bg-blue-50 text-blue-700 border-blue-100'
            case 'PROCESSING': return 'bg-amber-50 text-amber-700 border-amber-100'
            case 'SHIPPED': return 'bg-indigo-50 text-indigo-700 border-indigo-100'
            case 'DELIVERED': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
            case 'CANCELLED': return 'bg-rose-50 text-rose-700 border-rose-100'
            default: return 'bg-slate-50 text-slate-700 border-slate-100'
        }
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Đơn hàng</h1>
                <p className="text-slate-500 text-sm">Kiểm tra thông tin chi tiết và cập nhật tiến độ giao hàng cho khách hàng.</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Filter size={18} className="text-slate-400" />
                    <select
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-all cursor-pointer font-medium"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="ORDER_PLACED">Chờ xác nhận</option>
                        <option value="PROCESSING">Đang chuẩn bị</option>
                        <option value="SHIPPED">Đang giao hàng</option>
                        <option value="DELIVERED">Đã giao thành công</option>
                        <option value="CANCELLED">Đã hủy đơn</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đơn hàng</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Khách hàng & Liên hệ</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Địa chỉ giao hàng</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sản phẩm đã đặt</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng tiền</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Xử lý</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-8"><div className="h-14 bg-slate-50 rounded-2xl"></div></td>
                                    </tr>
                                ))
                            ) : filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/40 transition-colors group">
                                        <td className="px-6 py-5">
                                            <p className="font-black text-slate-800 text-sm tracking-tighter">#{order.id.slice(-6).toUpperCase()}</p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-5 min-w-[200px]">
                                            <div className="flex items-start gap-2">
                                                <User size={14} className="text-blue-500 mt-1" />
                                                <div>
                                                    <p className="font-bold text-slate-700 text-xs">{order.user?.name}</p>
                                                    <p className="text-[10px] text-slate-400">{order.user?.email}</p>
                                                    <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full w-fit">
                                                        <Phone size={10} /> {order.address?.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 min-w-[220px]">
                                            <div className="flex items-start gap-2">
                                                <MapPin size={14} className="text-rose-500 mt-1" />
                                                <div className="text-[11px] text-slate-500 leading-relaxed">
                                                    <p className="font-medium text-slate-700">{order.address?.street}</p>
                                                    <p>{order.address?.city}, {order.address?.state}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 min-w-[240px]">
                                            <div className="space-y-1.5">
                                                {order.orderItems.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between gap-4 bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                                                        <span className="text-[11px] text-slate-600 font-medium truncate flex-1">{item.product.name}</span>
                                                        <span className="text-[11px] font-black text-indigo-600">x{item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-black text-slate-800">${order.total.toLocaleString()}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{order.paymentMethod}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(order.status)}`}>
                                                {order.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                {order.status === 'ORDER_PLACED' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, 'PROCESSING')}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black rounded-xl transition shadow-md shadow-blue-100 active:scale-95"
                                                    >
                                                        XÁC NHẬN
                                                    </button>
                                                )}
                                                {order.status === 'PROCESSING' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl transition shadow-md shadow-indigo-100 active:scale-95"
                                                    >
                                                        GIAO HÀNG
                                                    </button>
                                                )}
                                                {order.status === 'SHIPPED' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-xl transition shadow-md shadow-emerald-100 active:scale-95"
                                                    >
                                                        HOÀN TẤT
                                                    </button>
                                                )}

                                                {['ORDER_PLACED', 'PROCESSING'].includes(order.status) && (
                                                    <button
                                                        onClick={() => { if(confirm("Hủy đơn hàng này?")) handleUpdateStatus(order.id, 'CANCELLED') }}
                                                        className="p-2 text-slate-300 hover:text-rose-600 transition-colors bg-slate-50 hover:bg-rose-50 rounded-xl"
                                                        title="Hủy đơn"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                )}

                                                {order.status === 'DELIVERED' && (
                                                    <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl border border-emerald-100">
                                                        <CheckCircle size={18} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-300">
                                            <ShoppingCart size={64} strokeWidth={1} />
                                            <p className="text-sm font-bold uppercase tracking-widest">Không có đơn hàng nào</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
