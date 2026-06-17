'use client'
import React, { useEffect, useState } from 'react'
import Title from './Title'
import ProductCard from './ProductCard'

// 1. Khai báo mảng dữ liệu mẫu (Mock data) cố định ở đây để "chống móm" cho giao diện
const MOCK_PRODUCTS = [
    { id: "mock-1", name: "Áo Hoodie Local Brand mẫu", price: 25, description: "Hàng mẫu", category: "Áo", images: "",rating: [] },
    { id: "mock-2", name: "Giày Sneaker Thể Thao mẫu", price: 45, description: "Hàng mẫu", category: "Giày", images: "",rating: [] },
    { id: "mock-3", name: "Balo Đi Học Chống Nước mẫu", price: 18, description: "Hàng mẫu", category: "Phụ kiện", images: "",rating: [] },
    { id: "mock-4", name: "Nón Kết Thời Trang mẫu", price: 12, description: "Hàng mẫu", category: "Phụ kiện", images: "",rating: [] },
];

const LatestProducts = () => {
    const displayQuantity = 4 // Cần hiển thị tối đa 4 sản phẩm
    const [realProducts, setRealProducts] = useState([]) // Nơi chứa sản phẩm thật từ DB
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRealProducts = async () => {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                if (res.ok) setRealProducts(data);
            } catch (error) {
                console.error("Lỗi lấy sản phẩm thật:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRealProducts();
    }, []);

    // ➔ 2. ĐOẠN CODE PHỐI HỢP: Gộp hàng thật lên trước, hàng mẫu đứng sau
    const combinedProducts = [
        ...realProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), // Hàng thật mới đăng lên đầu
        ...MOCK_PRODUCTS // Hàng mẫu xếp hàng chờ phía sau
    ].slice(0, displayQuantity); // Chỉ lấy đúng 4 sản phẩm đầu tiên để vẽ giao diện

    if (loading) return <div className="text-center my-20 animate-pulse text-sm text-slate-400">Đang tải...</div>;

    return (
        <div className="px-6 my-30 max-w-6xl mx-auto">
            <Title 
                title="Sản phẩm mới nhất" 
                         href="/shop" 
            />
            <div className="mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between">
                {combinedProducts.map((product, index) => (
                    <ProductCard key={product.id || index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default LatestProducts