'use client'
import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Loader2, ImageIcon } from 'lucide-react';

export default function InventoryPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/seller/products')
            .then(res => res.json())
            .then(data => { if(Array.isArray(data)) setProducts(data); })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-white">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><SlidersHorizontal size={16} /></div>
                <div>
                    <h2 className="text-sm font-bold text-slate-800">Quản lý tồn kho hàng hóa</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Kiểm soát số lượng sản phẩm đang lưu kho vật lý.</p>
                </div>
            </div>

            <div className="w-full overflow-x-auto">
                {loading ? <div className="py-12 text-center text-xs"><Loader2 className="animate-spin inline mr-2 text-amber-500" size={16} />Đang bốc dữ liệu kho...</div> : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 border-b text-[10px] font-bold text-slate-400 uppercase tracking-wider"><th className="py-3 px-5">Sản phẩm</th><th className="py-3 px-4">Số lượng trong kho</th><th className="py-3 px-4">Tình trạng</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {products.map((product) => {
                                let imgUrl = product.images?.startsWith("[") ? JSON.parse(product.images)[0] : product.images;
                                const isLowStock = product.stock <= 10;
                                return (
                                    <tr key={product.id} className="hover:bg-slate-50/20">
                                        <td className="py-3.5 px-5 flex items-center gap-3">
                                            <div className="size-9 rounded-lg border bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                                                {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" /> : <ImageIcon size={14} />}
                                            </div>
                                            <div><p className="font-bold text-slate-700">{product.name}</p></div>
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-slate-700">{product.stock} món</td>
                                        <td className="py-3.5 px-4">
                                            {isLowStock ? (
                                                <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 border border-amber-200 rounded animate-pulse">⚠️ Sắp hết hàng</span>
                                            ) : (
                                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 border border-emerald-200 rounded">✓ An toàn</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}