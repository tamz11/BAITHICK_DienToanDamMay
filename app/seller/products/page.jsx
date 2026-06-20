'use client'
import React, { useState, useEffect } from 'react';
import { Search, PackageOpen, ImageIcon, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function AllProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    // 📥 HÀM LẤY DANH SÁCH SẢN PHẨM THẬT TỪ DATABASE
    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/seller/products');
            const data = await res.json();
            if (res.ok) setProducts(data);
        } catch (error) { 
            console.error("Lỗi đồng bộ sản phẩm:", error); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { 
        fetchProducts(); 
    }, []);

    // 📊 BỘ TÍNH TOÁN SỐ LƯỢNG SẢN PHẨM THEO TỪNG TRẠNG THÁI REALTIME
    const countAll = products.length;
    const countPending = products.filter(p => p.status?.toUpperCase() === 'PENDING').length;
    const countApproved = products.filter(p => p.status?.toUpperCase() === 'APPROVED').length;
    const countRejected = products.filter(p => p.status?.toUpperCase() === 'REJECTED').length;

    // Lọc sản phẩm hiển thị trên bảng dựa theo Tab được click chọn
    const filteredProducts = products.filter(p => {
        if (activeTab === 'all') return true;
        return p.status?.toUpperCase() === activeTab.toUpperCase();
    });

    return (
        <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            
            {/* TIÊU ĐỀ KHUNG QUẢN LÝ */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                <div>
                    <h2 className="text-sm font-bold text-slate-800">Tất cả sản phẩm</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Theo dõi chi tiết trạng thái phê duyệt và phản hồi từ nhân viên hệ thống.</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <input type="text" placeholder="Tìm kiếm sản phẩm..." className="w-full bg-slate-50 border border-slate-200 text-xs pl-8 pr-4 py-2 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-700" />
                    <Search className="absolute left-2.5 top-2.5 text-slate-400" size={13} />
                </div>
            </div>

            {/* 🌟 CẬP NHẬT: THANH CHUYỂN TAB CHỨA ĐẦY ĐỦ 4 TRẠNG THÁI THEO TIÊU CHUẨN */}
            <div className="flex items-center overflow-x-auto border-b border-slate-100 px-3 bg-slate-50/40 select-none scrollbar-none">
                {[
                    { id: 'all', label: 'Tất cả', count: countAll, cls: 'border-emerald-600 text-emerald-600' },
                    { id: 'pending', label: 'Chưa duyệt', count: countPending, cls: 'border-amber-500 text-amber-600' },
                    { id: 'approved', label: 'Đã duyệt công khai', count: countApproved, cls: 'border-green-600 text-green-600' },
                    { id: 'rejected', label: 'Bị từ chối duyệt', count: countRejected, cls: 'border-rose-600 text-rose-600' } // Tab mới thêm
                ].map((tab) => {
                    const isSelected = activeTab === tab.id;
                    return (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id)} 
                            className={`flex items-center gap-1.5 py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer
                                ${isSelected ? tab.cls : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                        >
                            {tab.label} 
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-all
                                ${isSelected ? 'bg-slate-100 font-extrabold' : 'bg-slate-100 text-slate-400'}`}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* BẢNG HIỂN THỊ DỮ LIỆU */}
            <div className="w-full overflow-x-auto">
                {loading ? (
                    <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin text-emerald-600" size={16} />
                        Đang đồng bộ danh sách sản phẩm...
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                                <th className="py-3.5 px-5 w-[50%]">Sản phẩm</th>
                                <th className="py-3.5 px-4">Doanh thu (30 ngày)</th>
                                <th className="py-3.5 px-4">Giá bán</th>
                                <th className="py-3.5 px-4">Kho hàng</th>
                                <th className="py-3.5 px-4">Trạng thái duyệt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => {
                                    // Xử lý đọc chuỗi ảnh bốc từ DO Spaces
                                    let imgUrl = product.images?.startsWith("[") ? JSON.parse(product.images)[0] : product.images;
                                    const statusUpper = product.status?.toUpperCase() || 'PENDING';

                                    return (
                                        <tr key={product.id} className="hover:bg-slate-50/30 transition-colors">
                                            {/* CỘT SẢN PHẨM */}
                                            <td className="py-3.5 px-5 flex items-center gap-3">
                                                <div className="size-10 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                                                    {imgUrl && !imgUrl.includes("placeholder") ? (
                                                        <img src={imgUrl} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon size={14} className="text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-700 truncate">{product.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono tracking-wider">ID: {product.id}</p>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-emerald-600 bg-emerald-50/20">
                                                 ${Number(product.revenue30Days || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                             </td>

                                            {/* CỘT GIÁ BÁN */}
                                            <td className="py-3.5 px-4 font-bold text-slate-800">
                                                ${Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>

                                            {/* CỘT KHO HÀNG */}
                                            <td className="py-3.5 px-4 font-medium text-slate-500">
                                                {product.stock} món
                                            </td>

                                            {/* CỘT TRẠNG THÁI DUYỆT (HIỂN THỊ ĐA SẮC ĐỘ) */}
                                            <td className="py-3.5 px-4">
                                                {statusUpper === 'APPROVED' ? (
                                                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 border border-green-200 rounded shadow-sm">
                                                        <CheckCircle2 size={10} /> Đã duyệt
                                                    </span>
                                                ) : statusUpper === 'REJECTED' ? (
                                                    // 🌟 THIẾT KẾ MỚI: Nhãn hiển thị rực rỡ khi sản phẩm bị Staff nhấn từ chối
                                                    <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 border border-rose-200 rounded shadow-sm">
                                                        <AlertCircle size={10} /> Bị từ chối
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 border border-amber-200 rounded shadow-sm">
                                                        <Clock size={10} /> Chưa duyệt
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                /* GIAO DIỆN KHI PHÂN MỤC TRỐNG HÀNG */
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <PackageOpen size={32} className="text-slate-300" />
                                            <p className="text-xs font-medium">Không tìm thấy sản phẩm nào ở phân mục bộ lọc này.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}