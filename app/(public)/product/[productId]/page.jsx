'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function Product() {

    const { productId } = useParams();
    const [product, setProduct] = useState();
    const products = useSelector(state => state.product.list);
useEffect(() => {
    const fetchProduct = async () => {
        let matchedProduct = products.find((p) => p.id === productId);
        
        // 2. 🌟 NẾU KHÔNG CÓ TRONG REDUX: Gọi API bốc dữ liệu thật từ MySQL lên
        if (!matchedProduct && productId) {
            try {
                const res = await fetch(`/api/products/${productId}`);
                if (res.ok) {
                    matchedProduct = await res.json();
                } else {
                    console.log("Không tìm thấy sản phẩm này ở cả Redux lẫn Database");
                }
            } catch (error) {
                console.error("Lỗi lấy chi tiết sản phẩm thật:", error);
            }
        }

        setProduct(matchedProduct);
    }

    
        if (productId) {
            fetchProduct();
        }
        window.scrollTo(0, 0);
    }, [productId,products]);

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrumbs */}
                <div className="  text-gray-600 text-sm mt-8 mb-5">
                    Trang chủ / Sản phẩm / <span className="font-medium text-slate-800">{product?.category || "Chưa phân loại"}</span>
                </div>

                {/* Product Details */}
                {product && (<ProductDetails product={product} />)}

                {/* Description & Reviews */}
                {product && (<ProductDescription product={product} />)}
            </div>
        </div>
    );
}