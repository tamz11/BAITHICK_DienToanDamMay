'use client'
import React, { useState, useEffect } from 'react';
import { Loader2, ImageIcon, SquarePen, Trash2, X, PlusCircle, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddProductPage() {
    // --- STATE QUẢN LÝ KHO DỮ LIỆU BÊN CẠNH ---
    const [products, setProducts] = useState([]);
    const [loadingList, setLoadingList] = useState(true);

    // --- 🌟 STATE KIỂM SOÁT CHẾ ĐỘ FORM (CREATE VS EDIT) ---
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState('');

    // --- STATE CỦA CÁC TRƯỜNG NHẬP LIỆU ---
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [mrp, setMrp] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [stock, setStock] = useState('');
    const [imageBase64, setImageBase64] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [fileName, setFileName] = useState('Không có tệp nào được chọn');
    const [submitting, setSubmitting] = useState(false);

    // 📥 HÀM ĐỒNG BỘ DANH SÁCH SẢN PHẨM TỪ DATABASE
    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/seller/products');
            const data = await res.json();
            if (res.ok) setProducts(data);
        } catch (error) {
            console.error("Lỗi sync danh sách:", error);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // 📸 XỬ LÝ KHI CHỌN FILE FILE ẢNH
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            setImagePreview(URL.createObjectURL(file));

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setImageBase64(reader.result);
            };
        }
    };

    // 📝 HÀM KÍCH HOẠT CHẾ ĐỘ SỬA: ĐỔ NGƯỢC DATA VÀO FORM TRÁI
    const handleEditClick = (product) => {
        let imgUrl = product.images?.startsWith("[") ? JSON.parse(product.images)[0] : product.images;
        
        setIsEditing(true);
        setEditingId(product.id);
        setName(product.name);
        setDescription(product.description || '');
        setMrp(product.mrp || product.price);
        setPrice(product.price);
        setCategory(product.category || '');
        setStock(product.stock);
        setEditPreviewState(imgUrl);
    };

    const setEditPreviewState = (imgUrl) => {
        if (imgUrl && !imgUrl.includes("placeholder")) {
            setImagePreview(imgUrl);
            setFileName("Giữ file ảnh cũ");
        } else {
            setImagePreview(null);
            setFileName("Không có tệp nào được chọn");
        }
        setImageBase64(''); // Reset base64, chỉ nạp lại nếu người dùng chọn file mới
    };

    // ❌ HÀM HỦY CHẾ ĐỘ SỬA, QUAY VỀ FORM THÊM MỚI TRỐNG
    const resetForm = () => {
        setIsEditing(false);
        setEditingId('');
        setName(''); setDescription(''); setMrp(''); setPrice(''); setCategory(''); setStock('');
        setImagePreview(null); setImageBase64(''); setFileName('Không có tệp nào được chọn');
    };

    // 🗑️ HÀM KÍCH HOẠT LỆNH XÓA SẢN PHẨM REALTIME
    const handleDeleteClick = async (id, productName) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa hoàn toàn sản phẩm "${productName}"?`)) return;

        try {
            const res = await fetch(`/api/seller/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Xóa sản phẩm thành công!");
                if (isEditing && editingId === id) resetForm(); // Nếu đang sửa đúng file bị xóa thì reset form
                fetchProducts();
            } else {
                toast.error("Lỗi từ hệ thống, không thể xóa.");
            }
        } catch (err) {
            toast.error("Lỗi kết nối máy chủ.");
        }
    };

    // 📤 HÀM XỬ LÝ SUBMIT (TỰ ĐỘNG PHÂN TÁCH LỆNH THÊM / SỬA)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !price || !stock) {
            toast.error("Vui lòng điền đầy đủ Tên, Giá bán và Số lượng");
            return;
        }

        setSubmitting(true);
        
        // Cấu hình URL và phương thức fetch động dựa trên Mode
        const apiUrl = isEditing ? `/api/seller/products/${editingId}` : '/api/seller/products';
        const apiMethod = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(apiUrl, {
                method: apiMethod,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    mrp: mrp || price,
                    price,
                    category,
                    stock,
                    images: imageBase64 // Backend tự nhận diện cập nhật ảnh mới hay giữ ảnh cũ
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gặp lỗi xử lý");

            toast.success(isEditing ? "Cập nhật sản phẩm thành công! Đang chờ duyệt lại." : "Tạo sản phẩm mới thành công! Đang chờ duyệt.");
            
            resetForm(); // Xóa sạch form quay về trạng thái thêm mới
            fetchProducts(); // Cập nhật lại danh sách bên phải
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full flex flex-col xl:flex-row gap-6 items-start animate-fadeIn">
            
            {/* ==========================================
                ➕ BÊN TRÁI: FORM TẠO/SỬA SẢN PHẨM (MẪU RÒN GÓC CỦA BẠN)
                ========================================== */}
            <div className="w-full xl:w-[480px] bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shrink-0">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        {isEditing ? "📝 Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}
                    </h2>
                    {isEditing && (
                        <button type="button" onClick={resetForm} className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-md hover:bg-slate-200 transition flex items-center gap-1 cursor-pointer">
                            <PlusCircle size={10} /> Chuyển Thêm mới
                        </button>
                    )}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tên sản phẩm */}
                    <div className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white focus-within:border-indigo-500 transition-all">
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên sản phẩm" className="w-full bg-transparent text-xs outline-none text-slate-700" />
                    </div>

                    {/* Mô tả chi tiết */}
                    <div className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white focus-within:border-indigo-500 transition-all">
                        <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả chi tiết sản phẩm..." className="w-full bg-transparent text-xs outline-none text-slate-700 resize-none"></textarea>
                    </div>

                    {/* Chọn hình ảnh */}
                    <div className="space-y-2">
                        {imagePreview && (
                            <div className="w-full h-28 border border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center relative">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                <button type="button" onClick={() => { setImagePreview(null); setImageBase64(''); setFileName('Không có tệp nào được chọn') }} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-[9px] hover:bg-red-600 shadow">Xóa</button>
                            </div>
                        )}
                        <div className="w-full border border-slate-300 rounded-xl p-2 bg-white flex items-center gap-3">
                            <label className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[11px] font-bold px-4 py-2 rounded-lg cursor-pointer transition shrink-0">
                                Chọn tệp ảnh
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                            <span className="text-[11px] text-slate-400 truncate flex-1">{fileName}</span>
                        </div>
                    </div>

                    {/* Dòng giá */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="border border-slate-300 rounded-xl px-4 py-2.5 bg-white focus-within:border-indigo-500 transition-all">
                            <input type="number" value={mrp} onChange={(e) => setMrp(e.target.value)} placeholder="Giá niêm yết (MRP)" className="w-full bg-transparent text-xs outline-none text-slate-700" />
                        </div>
                        <div className="border border-slate-300 rounded-xl px-4 py-2.5 bg-white focus-within:border-indigo-500 transition-all">
                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Giá bán thực tế" className="w-full bg-transparent text-xs outline-none text-slate-700" />
                        </div>
                    </div>

                    {/* Phân loại & Kho hàng */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="border border-slate-300 rounded-xl px-4 py-2.5 bg-white focus-within:border-indigo-500 transition-all">
                            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Danh mục phân loại" className="w-full bg-transparent text-xs outline-none text-slate-700" />
                        </div>
                        <div className="border border-slate-300 rounded-xl px-4 py-2.5 bg-white focus-within:border-indigo-500 transition-all">
                            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Số lượng nhập kho" className="w-full bg-transparent text-xs outline-none text-slate-700" />
                        </div>
                    </div>

                    {/* Nút gửi hoặc cập nhật */}
                    <button 
                        type="submit" 
                        disabled={submitting} 
                        className={`w-full text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-2
                            ${isEditing ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="animate-spin" size={14} /> Đang xử lý đồng bộ Cloud...
                            </>
                        ) : (
                            isEditing ? "Xác nhận cập nhật sản phẩm" : "Xác nhận gửi duyệt"
                        )}
                    </button>
                </form>
            </div>

            {/* ==========================================
                📋 BÊN PHẢI: DANH SÁCH TÍCH HỢP BỘ ĐÔI NÚT SỬA & XÓA ĐỘNG
                ========================================== */}
            <div className="flex-1 w-full bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm overflow-hidden flex flex-col min-h-[520px]">
                <div className="mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Danh sách quản lý nhanh</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tổng số hàng hóa hiện tại: <span className="font-bold text-slate-600">{products.length} sản phẩm</span></p>
                </div>

                <div className="divide-y divide-slate-100 overflow-y-auto max-h-[560px] pr-1 scrollbar-thin">
                    {loadingList ? (
                        <div className="py-20 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin text-emerald-600" size={16} /> Đang nạp danh sách...
                        </div>
                    ) : products.length > 0 ? (
                        products.map((product) => {
                            let imgUrl = product.images?.startsWith("[") ? JSON.parse(product.images)[0] : product.images;
                            const statusUpper = product.status?.toUpperCase() || 'PENDING';
                            const isThisItemEditing = isEditing && editingId === product.id;

                            return (
                                <div key={product.id} className={`flex items-center justify-between py-3.5 first:pt-0 px-2 rounded-xl transition group
                                    ${isThisItemEditing ? 'bg-indigo-50/70 border border-indigo-100 shadow-sm' : 'hover:bg-slate-50/40 border border-transparent'}`}>
                                    
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="size-11 rounded-xl border bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                                            {imgUrl && !imgUrl.includes("placeholder") ? <img src={imgUrl} className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-slate-300" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-xs text-slate-700 truncate">{product.name}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                                                Kho: <span className="text-slate-600 font-bold">{product.stock} món</span> | Giá: <span className="text-slate-600 font-bold">${product.price}</span>
                                            </p>
                                            {/* Thẻ tag trạng thái nhỏ gọn */}
                                            <div className="mt-1.5">
                                                {statusUpper === 'APPROVED' ? (
                                                    <span className="inline-flex items-center gap-0.5 bg-green-50 text-green-700 text-[9px] font-bold px-1.5 py-0.2 rounded border border-green-200"><CheckCircle2 size={8} /> Đã duyệt</span>
                                                ) : statusUpper === 'REJECTED' ? (
                                                    <span className="inline-flex items-center gap-0.5 bg-rose-50 text-rose-700 text-[9px] font-bold px-1.5 py-0.2 rounded border border-rose-200"><AlertCircle size={8} /> Bị từ chối</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-200"><Clock size={8} /> Chờ duyệt</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 🌟 CỤM NÚT SỬA VÀ XÓA TÍNH NĂNG TƯƠNG TÁC ĐỘNG */}
                                    <div className="flex items-center gap-1.5 ml-4 shrink-0 opacity-40 group-hover:opacity-100 transition duration-150">
                                        <button 
                                            type="button"
                                            onClick={() => handleEditClick(product)}
                                            title="Sửa sản phẩm này" 
                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition cursor-pointer shadow-xs active:scale-90"
                                        >
                                            <SquarePen size={13} />
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => handleDeleteClick(product.id, product.name)}
                                            title="Xóa sản phẩm này" 
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition cursor-pointer shadow-xs active:scale-90"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                            <PackageOpen size={32} className="text-slate-300" />
                            <p className="text-xs font-medium">Chưa có sản phẩm nào trong cửa hàng</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}