'use client'
import { storesDummyData } from "@/assets/assets"
import StoreInfo from "@/components/admin/StoreInfo"
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminApprove() {

    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)


    const fetchStores = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/stores?status=pending', { credentials: 'include' })
            const data = await res.json()
            if (!res.ok) {
                console.error('Failed to fetch pending stores', data)
                setStores([])
            } else {
                setStores(data.stores || [])
            }
        } catch (err) {
            console.error('Fetch stores error', err)
            setStores([])
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async ({ storeId, status }) => {
        try {
            const res = await fetch('/api/admin/stores', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ storeId, status })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Lỗi hệ thống')
            await fetchStores()
            return data
        } catch (err) {
            console.error('Approve error', err)
            throw err
        }
    }

    useEffect(() => {
            fetchStores()
    }, [])

    return !loading ? (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">Duyệt <span className="text-slate-800 font-medium">Cửa hàng</span></h1>

            {stores.length ? (
                <div className="flex flex-col gap-4 mt-4">
                    {stores.map((store) => (
                        <div key={store.id} className="bg-white border rounded-lg shadow-sm p-6 flex max-md:flex-col gap-4 md:items-end max-w-4xl" >
                            {/* Store Info */}
                            <StoreInfo store={store} />

                            {/* Actions */}
                            <div className="flex gap-3 pt-2 flex-wrap">
                                <button onClick={() => toast.promise(handleApprove({ storeId: store.id, status: 'approved' }), { loading: "Đang duyệt" })} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm" >
                                    Duyệt
                                </button>
                                <button onClick={() => toast.promise(handleApprove({ storeId: store.id, status: 'rejected' }), { loading: 'Đang từ chối' })} className="px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600 text-sm" >
                                    Từ chối
                                </button>
                            </div>
                        </div>
                    ))}

                </div>) : (
                <div className="flex items-center justify-center h-80">
                    <h1 className="text-3xl text-slate-400 font-medium">No Application Pending</h1>
                </div>
            )}
        </div>
    ) : <Loading />
}