'use client'
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setProduct } from "@/lib/features/product/productSlice";
import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";

export default function Home() {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Thêm timestamp để tránh cache trình duyệt, luôn lấy dữ liệu mới nhất
                const res = await fetch(`/api/products?t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    dispatch(setProduct(data));
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, [dispatch]);

    return (
        <div>
            <Hero />
            
            <LatestProducts />
            <BestSelling />
            <OurSpecs />
            <Newsletter />
        </div>
    );
}
