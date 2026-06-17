'use client'
import { useState, useEffect } from 'react'
import { Check, X, Eye, Package, Store } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StaffProductsPage() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchPendingProducts = async () => {
        try {
            const res = await fetch('/api/staff/products')
            const data = await res.json()
            if (res.ok) setProducts(data)
        } catch (error) {
            toast.error("Không thể tải danh sách sản phẩm")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPendingProducts()
    }, [])

    const handleAction = async (productId, status) => {
        try {
            const res = await fetch('/api/staff/products', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, status })
            })
            if (res.ok) {
                toast.success(status === 'APPROVED' ? "Đã duyệt sản phẩm" : "đã từ chối sản phẩm")
                setProducts(products.filter(p => p.id !== productId))
            } else {
                const data = await res.json()
                toast.error(data.error || "Có lỗi xảy ra")
            }
        } catch (error) {
            toast.error("Lỗi kết nối server")
        }
    }

    if (loading) return <div className="text-center py-10">Đang tải dữ liệu...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Duyệt sản phẩm mới</h1>
                <span className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-semibold">
                    {products.length} chờ duyệt
                </span>
            </div>

            {products.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
                    <Package className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500">Hiện không có sản phẩm nào đang chờ duyệt.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
                            <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                {product.images ? (
                                    <img src={product.images} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <Package size={32} />
                                )}
                            </div>

                            <div className="flex-1 space-y-1">
                                <h3 className="font-bold text-lg text-slate-800">{product.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1"><Store size={14}/> {product.store?.name}</span>
                                    <span>Danh mục: {product.category}</span>
                                    <span className="font-semibold text-blue-600 text-base">{product.price.toLocaleString()}đ</span>
                                </div>
                                <p className="text-slate-400 text-sm line-clamp-1">{product.description}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleAction(product.id, 'REJECTED')}
                                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"
                                    title="Từ chối"
                                >
                                    <X size={20} />
                                </button>
                                <button
                                    onClick={() => handleAction(product.id, 'APPROVED')}
                                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2 font-semibold"
                                >
                                    <Check size={20} /> Duyệt sản phẩm
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
