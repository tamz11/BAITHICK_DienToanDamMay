'use client'
import ProductCard from "@/components/ProductCard"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MailIcon, MapPinIcon } from "lucide-react"
import Loading from "@/components/Loading"
<<<<<<< HEAD
=======
import Image from "next/image"
import { dummyStoreData, productDummyData } from "@/assets/assets"
>>>>>>> 5e6f11fbe23afe2ef2180f979c7d843b9b483f09

export default function StoreShop() {

    const { username } = useParams()
    const [products, setProducts] = useState([])
    const [storeInfo, setStoreInfo] = useState(null)
    const [loading, setLoading] = useState(true)
<<<<<<< HEAD
    const [error, setError] = useState(null)

    const fetchStoreData = async () => {
        try {
            const res = await fetch(`/api/store/${encodeURIComponent(username)}/products?t=${Date.now()}`, {
                cache: 'no-store'
            })
            if (!res.ok) {
                const body = await res.json()
                setError(body?.error || 'Không thể tải cửa hàng')
                return
            }

            const data = await res.json()
            setStoreInfo(data.store)
            setProducts(data.products || [])
        } catch (err) {
            console.error('Error loading store products:', err)
            setError('Lỗi khi tải dữ liệu cửa hàng')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!username) return
        fetchStoreData()
    }, [username])

    if (loading) return <Loading />

    return (
        <div className="min-h-[70vh] mx-6">
            {error ? (
                <div className="max-w-7xl mx-auto mt-10 rounded-xl bg-red-50 border border-red-200 p-6 text-red-700">
                    {error}
                </div>
            ) : (
                <>
                    {/* Store Info Banner */}
                    {storeInfo && (
                        <div className="max-w-7xl mx-auto bg-slate-50 rounded-xl p-6 md:p-10 mt-6 flex flex-col md:flex-row items-center gap-6 shadow-xs">
                            <div className="min-w-[200px] max-w-[200px] overflow-hidden rounded-md border border-slate-200 bg-white">
                                <img
                                    src={storeInfo.logo || '/favicon.ico'}
                                    alt={storeInfo.name || 'Store logo'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = '/favicon.ico' }}
                                />
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-semibold text-slate-800">{storeInfo.name || storeInfo.username}</h1>
                                <p className="text-sm text-slate-600 mt-2 max-w-lg">{storeInfo.description || 'Cửa hàng chuyên cung cấp sản phẩm chất lượng.'}</p>
                                <div className="space-y-2 text-sm text-slate-500 mt-4">
                                    {storeInfo.address && (
                                        <div className="flex items-center">
                                            <MapPinIcon className="w-4 h-4 text-gray-500 mr-2" />
                                            <span>{storeInfo.address}</span>
                                        </div>
                                    )}
                                    {storeInfo.email && (
                                        <div className="flex items-center">
                                            <MailIcon className="w-4 h-4 text-gray-500 mr-2" />
                                            <span>{storeInfo.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Products */}
                    <div className="max-w-7xl mx-auto mb-40">
                        <h1 className="text-2xl mt-12">Shop <span className="text-slate-800 font-medium">Products</span></h1>
                        {products.length === 0 ? (
                            <div className="mt-8 text-slate-600">Không có sản phẩm nào trong cửa hàng này.</div>
                        ) : (
                            <div className="mt-5 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto">
                                {products.map((product) => <ProductCard key={product.id} product={product} />)}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
=======

    const fetchStoreData = async () => {
        setStoreInfo(dummyStoreData)
        setProducts(productDummyData)
        setLoading(false)
    }

    useEffect(() => {
        fetchStoreData()
    }, [])

    return !loading ? (
        <div className="min-h-[70vh] mx-6">

            {/* Store Info Banner */}
            {storeInfo && (
                <div className="max-w-7xl mx-auto bg-slate-50 rounded-xl p-6 md:p-10 mt-6 flex flex-col md:flex-row items-center gap-6 shadow-xs">
                    <Image
                        src={storeInfo.logo}
                        alt={storeInfo.name}
                        className="size-32 sm:size-38 object-cover border-2 border-slate-100 rounded-md"
                        width={200}
                        height={200}
                    />
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-semibold text-slate-800">{storeInfo.name}</h1>
                        <p className="text-sm text-slate-600 mt-2 max-w-lg">{storeInfo.description}</p>
                        <div className="text-xs text-slate-500 mt-4 space-y-1"></div>
                        <div className="space-y-2 text-sm text-slate-500">
                            <div className="flex items-center">
                                <MapPinIcon className="w-4 h-4 text-gray-500 mr-2" />
                                <span>{storeInfo.address}</span>
                            </div>
                            <div className="flex items-center">
                                <MailIcon className="w-4 h-4 text-gray-500 mr-2" />
                                <span>{storeInfo.email}</span>
                            </div>
                           
                        </div>
                    </div>
                </div>
            )}

            {/* Products */}
            <div className=" max-w-7xl mx-auto mb-40">
                <h1 className="text-2xl mt-12">Shop <span className="text-slate-800 font-medium">Products</span></h1>
                <div className="mt-5 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto">
                    {products.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
            </div>
        </div>
    ) : <Loading />
}
>>>>>>> 5e6f11fbe23afe2ef2180f979c7d843b9b483f09
