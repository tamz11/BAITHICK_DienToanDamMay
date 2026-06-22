'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const BestSelling = () => {

    const displayQuantity = 8
    const products = useSelector(state => state.product.list) || []

    // Sắp xếp an toàn: Ưu tiên sản phẩm có nhiều lượt đánh giá nhất
    const sortedProducts = [...products].sort((a, b) => {
        const ratingA = a.rating ? (Array.isArray(a.rating) ? a.rating.length : 0) : 0
        const ratingB = b.rating ? (Array.isArray(b.rating) ? b.rating.length : 0) : 0
        return ratingB - ratingA
    })

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title
                title='Bán chạy nhất'
                description={`Hiển thị ${products.length < displayQuantity ? products.length : displayQuantity} trên tổng ${products.length} sản phẩm`}
                href='/shop'
            />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
                {sortedProducts.slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={product.id || index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default BestSelling
