'use client'
import React from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
// ➔ THÊM: Import useSelector để bốc dữ liệu từ Redux toàn cục theo kiến trúc mới của main
import { useSelector } from 'react-redux' 

// Mảng dữ liệu mẫu (Mock data) cố định của bạn để "chống móm" cho giao diện nếu DB trống
const MOCK_PRODUCTS = [
    { id: "mock-1", name: "Áo Hoodie Local Brand mẫu", price: 25, description: "Hàng mẫu", category: "Áo", images: "", rating: [] },
    { id: "mock-2", name: "Giày Sneaker Thể Thao mẫu", price: 45, description: "Hàng mẫu", category: "Giày", images: "", rating: [] },
    { id: "mock-3", name: "Balo Đi Học Chống Nước mẫu", price: 18, description: "Hàng mẫu", category: "Phụ kiện", images: "", rating: [] },
    { id: "mock-4", name: "Nón Kết Thời Trang mẫu", price: 12, description: "Hàng mẫu", category: "Phụ kiện", images: "", rating: [] },
];

const LatestProducts = () => {
    const displayQuantity = 4 // Chỉ hiển thị tối đa 4 sản phẩm ngoài trang chủ

    // 🌟 Lấy danh sách sản phẩm thật từ Redux (Nhánh main đã cấu hình nạp tự động từ MySQL vào đây)
    const storeProducts = useSelector(state => state.product.list) || []

    // ➔ Đcore GIỮ LẠI: Thuật toán sắp xếp an toàn theo thời gian tạo mới nhất của nhánh main
    const sortedRealProducts = [...storeProducts].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
    })

    // ➔ Đcore GỘP THÔNG MINH: Xếp hàng thật của DB lên đầu, hàng mẫu của bạn đứng xếp hàng chờ phía sau
    const combinedProducts = [
        ...sortedRealProducts,
        ...MOCK_PRODUCTS
    ].slice(0, displayQuantity); // Luôn luôn cắt đúng 4 sản phẩm xuất sắc nhất ra màn hình

    return (
        <div className="px-6 my-30 max-w-6xl mx-auto">
            {/* Sử dụng Component Title nâng cấp của nhánh main, tự động đếm tổng sản phẩm đang có */}
            <Title 
                title="Sản phẩm mới nhất" 
                description={`Hiển thị ${combinedProducts.length} sản phẩm nổi bật`}
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