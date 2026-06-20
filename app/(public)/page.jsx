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
            <section className="update-banner bg-blue-50 text-blue-900 p-4 rounded-md my-6 text-center">
                <p className="font-semibold">Cập nhật nhẹ: đây là phiên bản giao diện mới với nội dung hiển thị khác biệt.</p>
            </section>
            <LatestProducts />
            <BestSelling />
            <OurSpecs />
            <Newsletter />
        </div>
    );
}
