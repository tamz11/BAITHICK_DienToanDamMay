'use client'
import { XIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useDispatch } from "react-redux"
import { addAddress } from "@/lib/features/address/addressSlice"

const AddressModal = ({ setShowAddressModal }) => {
    const dispatch = useDispatch()
    const [address, setAddress] = useState({
        name: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: ''
    })

    const handleAddressChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const res = await fetch('/api/address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(address)
            })

            const data = await res.json()

            if (res.ok) {
                dispatch(addAddress(data.data))
                toast.success("Thêm địa chỉ thành công!")
                setShowAddressModal(false)
            } else {
                toast.error(data.error || "Không thể thêm địa chỉ")
            }
        } catch (error) {
            console.error("Lỗi thêm địa chỉ:", error)
            toast.error("Lỗi kết nối máy chủ")
        }
    }

    return (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">Thêm địa chỉ nhận hàng</h2>
                    <XIcon size={20} className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" onClick={() => setShowAddressModal(false)} />
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Họ tên</label>
                            <input name="name" onChange={handleAddressChange} value={address.name} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs transition-all" type="text" placeholder="Nguyễn Văn A" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Số điện thoại</label>
                            <input name="phone" onChange={handleAddressChange} value={address.phone} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs transition-all" type="text" placeholder="090..." required />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email</label>
                        <input name="email" onChange={handleAddressChange} value={address.email} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs transition-all" type="email" placeholder="email@example.com" required />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Địa chỉ (Số nhà, đường)</label>
                        <input name="street" onChange={handleAddressChange} value={address.street} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs transition-all" type="text" placeholder="123 Đường..." required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Thành phố</label>
                            <input name="city" onChange={handleAddressChange} value={address.city} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs transition-all" type="text" placeholder="Hà Nội" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Quận/Huyện</label>
                            <input name="state" onChange={handleAddressChange} value={address.state} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs transition-all" type="text" placeholder="Cầu Giấy" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Mã bưu điện</label>
                            <input name="zip" onChange={handleAddressChange} value={address.zip} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs transition-all" type="text" placeholder="10000" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Quốc gia</label>
                            <input name="country" onChange={handleAddressChange} value={address.country} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs transition-all" type="text" placeholder="Việt Nam" required />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-100 mt-4 text-sm">
                        Lưu địa chỉ này
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AddressModal;
