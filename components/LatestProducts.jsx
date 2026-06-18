'use client'
import React from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const LatestProducts = () => {
    const displayQuantity = 4
    const products = useSelector(state => state.product.list) || []

    // Sắp xếp an toàn theo thời gian tạo mới nhất
    const sortedProducts = [...products].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
    })

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title
                title='Sản phẩm mới nhất'
                description={`Hiển thị ${products.length < displayQuantity ? products.length : displayQuantity} trong ${products.length} sản phẩm`}
                href='/shop'
            />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between'>
                {sortedProducts.slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={product.id || index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default LatestProducts
