"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { categories as fallbackCategories } from "@/assets/assets"

const CategoriesMarquee = () => {
    const [items, setItems] = useState([])

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                const res = await fetch('/api/categories')
                if (!res.ok) throw new Error('Fetch failed')
                const data = await res.json()
                const list = (data.categories || []).map(c => c.name)
                if (mounted && list.length) setItems(list)
            } catch (e) {
                if (mounted) setItems(fallbackCategories || [])
            }
        })()
        return () => { mounted = false }
    }, [])

    const repeated = [...items, ...items, ...items, ...items]

    return (
        <div className="overflow-hidden w-full relative max-w-7xl mx-auto select-none group sm:my-20">
            <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
            <div className="flex min-w-[200%] animate-[marqueeScroll_10s_linear_infinite] sm:animate-[marqueeScroll_40s_linear_infinite] group-hover:[animation-play-state:paused] gap-4" >
                {repeated.map((text, index) => (
                    <Link key={index} href={`/shop?category=${encodeURIComponent(text)}`} className="px-5 py-2 bg-slate-100 rounded-lg text-slate-500 text-xs sm:text-sm hover:bg-slate-600 hover:text-white active:scale-95 transition-all duration-300 whitespace-nowrap">
                        {text}
                    </Link>
                ))}
            </div>
            <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
        </div>
    )
}

export default CategoriesMarquee