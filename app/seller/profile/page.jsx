'use client'
import React, { useState, useEffect } from 'react';
import { Loader2, Store, Phone, Mail, MapPin, FileText, Camera, CheckCircle, Edit3, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SellerProfilePage() {
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // State lưu thông tin cửa hàng sử dụng nội bộ ở Frontend
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [logo, setLogo] = useState('');
    const [logoBase64, setLogoBase64] = useState('');
    const [logoPreview, setLogoPreview] = useState(null);

    // Lấy thông tin cửa hàng từ API
    const fetchStoreProfile = async () => {
        try {
            const res = await fetch('/api/seller/profile');
            const data = await res.json();
            if (res.ok) {
                setName(data.name || '');
                setDescription(data.description || '');
                
                // 🌟 ĐÃ FIX: Đổi từ data.phone thành data.contact để bốc đúng cột từ MySQL
                setPhone(data.contact || ''); 
                
                setEmail(data.email || '');
                setAddress(data.address || '');
                setLogo(data.logo || '');
                setLogoPreview(data.logo || null);
            }
        } catch (err) {
            toast.error("Không thể tải thông tin hồ sơ cửa hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStoreProfile();
    }, []);

    // Xử lý đổi ảnh Logo
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setLogoBase64(reader.result);
            };
        }
    };

    // Gửi cập nhật thông tin lên Server
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!name) return toast.error("Tên cửa hàng không được để trống");

        setSubmitting(true);
        try {
            const res = await fetch('/api/seller/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, phone, email, address, logoBase64 })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gặp lỗi khi lưu");

            toast.success("Cập nhật hồ sơ cửa hàng thành công!");
            setIsEditMode(false);
            fetchStoreProfile(); // Tải lại thông tin mới nhất
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full py-32 flex flex-col items-center justify-center text-slate-400 text-xs gap-3">
                <Loader2 className="animate-spin text-emerald-600" size={24} />
                Đang nạp hồ sơ thông tin người bán...
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            
            {/* THANH ĐIỀU HƯỚNG TIÊU ĐỀ */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-base font-bold text-slate-800">Thông tin Người bán</h1>
                    <p className="text-[11px] text-slate-400 mt-0.5">Quản lý thông tin định danh thương hiệu cửa hàng trên hệ thống.</p>
                </div>
                {!isEditMode && (
                    <button 
                        onClick={() => setIsEditMode(true)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
                    >
                        <Edit3 size={13} /> Chỉnh sửa hồ sơ
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                
                {/* THẺ TRÁI: AVATAR / LOGO CỦA CỬA HÀNG */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="size-24 rounded-full bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner relative">
                        {logoPreview ? (
                            <img src={logoPreview} alt="Store Logo" className="w-full h-full object-cover" />
                        ) : (
                            <Store className="text-slate-300 stroke-[1.5]" size={36} />
                        )}
                        
                        {/* Nút bấm thay ảnh thông minh ẩn hiện khi ở chế độ Edit */}
                        {isEditMode && (
                            <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 cursor-pointer opacity-0 group-hover:opacity-100 transition duration-200">
                                <Camera size={16} /> Thay Logo
                                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                            </label>
                        )}
                    </div>
                    
                    <h2 className="font-bold text-slate-800 text-sm mt-4">{name || "Chưa đặt tên Shop"}</h2>
                    <span className="bg-emerald-50 text-emerald-700 font-bold text-[9px] px-2 py-0.5 rounded border border-green-200 mt-1.5 shadow-xs">Đối tác Gocart Plus</span>
                </div>

                {/* THẺ PHẢI: CHI TIẾT THÔNG TIN LIÊN HỆ */}
                <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    
                    {/* CHẾ ĐỘ 1: XEM CHI TIẾT THÔNG TIN NGƯỜI BÁN */}
                    {!isEditMode ? (
                        <div className="space-y-4 text-xs">
                            <h3 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">Hồ sơ công khai</h3>
                            <div className="flex items-start gap-3.5 py-1">
                                <Store className="text-slate-400 shrink-0 mt-0.5" size={15} />
                                <div><p className="text-slate-400 text-[10px] font-medium">Tên hiển thị cửa hàng</p><p className="font-bold text-slate-700 mt-0.5">{name}</p></div>
                            </div>
                            <div className="flex items-start gap-3.5 py-1">
                                <FileText className="text-slate-400 shrink-0 mt-0.5" size={15} />
                                <div><p className="text-slate-400 text-[10px] font-medium">Giới thiệu / Mô tả shop</p><p className="text-slate-600 mt-0.5 leading-relaxed">{description || "Chưa có bài viết giới thiệu cho cửa hàng này."}</p></div>
                            </div>
                            <hr className="border-slate-100" />
                            <h3 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase pt-2">Thông tin liên hệ vận chuyển</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3.5">
                                    <Phone className="text-slate-400" size={15} />
                                    <div><p className="text-slate-400 text-[10px] font-medium">Số điện thoại hotline</p><p className="font-semibold text-slate-700 mt-0.5">{phone || "Chưa cập nhật"}</p></div>
                                </div>
                                <div className="flex items-center gap-3.5">
                                    <Mail className="text-slate-400" size={15} />
                                    <div><p className="text-slate-400 text-[10px] font-medium">Email CSKH shop</p><p className="font-semibold text-slate-700 mt-0.5">{email || "Chưa cập nhật"}</p></div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3.5 pt-2">
                                <MapPin className="text-slate-400 shrink-0 mt-0.5" size={15} />
                                <div><p className="text-slate-400 text-[10px] font-medium">Địa chỉ lấy hàng kho vật lý</p><p className="font-semibold text-slate-700 mt-0.5 leading-relaxed">{address || "Chưa cập nhật địa chỉ lấy hàng"}</p></div>
                            </div>
                        </div>
                    ) : (
                        
                        // CHẾ ĐỘ 2: FORM CHỈNH SỬA THÔNG TIN NGƯỜI BÁN
                        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs animate-fadeIn">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Chỉnh sửa hồ sơ</h3>
                                <button type="button" onClick={() => { setIsEditMode(false); setLogoPreview(logo); }} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 font-semibold text-[11px] cursor-pointer"><ArrowLeft size={12}/> Quay lại xem</button>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-[11px] text-slate-400 font-bold">Tên cửa hàng <span className="text-red-500">*</span></label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-700 font-semibold" required />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] text-slate-400 font-bold">Mô tả giới thiệu cửa hàng</label>
                                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Nhập câu khẩu hiệu hoặc mô tả lĩnh vực kinh doanh..." className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-700 resize-none"></textarea>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] text-slate-400 font-bold">Số điện thoại liên hệ</label>
                                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 outline-none focus:border-emerald-500 focus:bg-white text-slate-700 font-medium" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] text-slate-400 font-bold">Email nhận thông báo đơn</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 outline-none focus:border-emerald-500 focus:bg-white text-slate-700 font-medium" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] text-slate-400 font-bold">Địa chỉ lấy hàng của bưu tá</label>
                                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số nhà, tên đường, quận/huyện, thành phố..." className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 outline-none focus:border-emerald-500 focus:bg-white text-slate-700 font-medium" />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setIsEditMode(false); setLogoPreview(logo); }} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition cursor-pointer text-center">Hủy thay đổi</button>
                                <button type="submit" disabled={submitting} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer">
                                    {submitting ? <Loader2 className="animate-spin" size={14} /> : <><CheckCircle size={14} /> Lưu thông tin hồ sơ</>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}