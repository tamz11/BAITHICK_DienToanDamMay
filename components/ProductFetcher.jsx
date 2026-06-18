'use client'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setProduct } from '@/lib/features/product/productSlice'

export default function ProductFetcher() {
    const dispatch = useDispatch()

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Thêm timestamp để phá cache, đảm bảo lấy dữ liệu mới nhất
                const res = await fetch(`/api/products?t=${Date.now()}`, {
                    cache: 'no-store'
                })
                if (res.ok) {
                    const data = await res.json()
                    dispatch(setProduct(data))
                }
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error)
            }
        }

        fetchProducts()
    }, [dispatch])

    return null
}
