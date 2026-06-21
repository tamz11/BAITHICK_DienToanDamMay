'use client'
import React, { useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
    LayoutDashboard, ShoppingBag, ClipboardList, LogOut,
    Grid3X3, BookOpen, Bell, ChevronDown, User, Plus, Package, 
    SlidersHorizontal, Store // 🌟 THÊM: Import thêm icon Store phục vụ Hồ sơ cửa hàng
} from "lucide-react"; 

import Footer from "../../components/Footer";

export default function SellerLayout({ children }) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [openProductMenu, setOpenProductMenu] = useState(true); // Mở sẵn menu con sản phẩm
    const [openShopMenu, setOpenShopMenu] = useState(true);       // 🌟 THÊM: Mở sẵn menu con của Shop

    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-slate-800">
            {/* 1. HEADER CONTROL PANEL */}
            <header className="w-full bg-white border-b border-slate-200/80 h-14 sticky top-0 z-50 shadow-sm shrink-0">
                <div className="w-full mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/seller" className="flex items-center gap-2 select-none">
                            <span className="text-xl font-extrabold text-emerald-600 tracking-tight">gocart</span>
                            <span className="text-sm font-semibold text-slate-600 border-l border-slate-300 pl-3">Kênh Người Bán</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-5">
                        <button className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"><Grid3X3 size={18} /></button>
                        <button className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"><BookOpen size={18} /></button>
                        <div className="relative cursor-pointer p-1 group">
                            <Bell size={18} className="text-slate-400 group-hover:text-slate-600 transition" />
                            <span className="absolute -top-1 -right-1.5 bg-[#EE4D2D] text-white text-[9px] font-bold px-1 rounded-full scale-90">99+</span>
                        </div>
                        <div className="relative">
                            <div onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 pl-3 border-l border-slate-200 cursor-pointer select-none group">
                                <div className="size-6 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 text-emerald-600"><User size={14} /></div>
                                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">{session?.user?.name || "Gocart Uni"}</span>
                                <ChevronDown size={14} className="text-slate-400" />
                            </div>
                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 text-xs">
                                    <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"><LogOut size={12} /> Đăng xuất</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. BODY LAYOUT */}
            <div className="flex flex-1 w-full max-w-[1440px] mx-auto relative">
                {/* SIDEBAR PHÂN CẤP PHONG CÁCH SHOPEE */}
                <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
                    <div className="space-y-4">
                        <nav className="flex flex-col gap-0.5">
                            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 mb-2">Bảng điều khiển</div>
                            
                            <Link href="/seller" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${pathname === '/seller' ? 'bg-slate-50 text-emerald-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                                <LayoutDashboard size={16} /> Doanh thu & Tổng quan
                            </Link>

                            {/* CỤM MENU CHA 1: QUẢN LÝ SẢN PHẨM */}
                            <div>
                                <button 
                                    onClick={() => setOpenProductMenu(!openProductMenu)}
                                    className="w-full flex items-center justify-between px-3 py-2.5 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition cursor-pointer select-none"
                                >
                                    <div className="flex items-center gap-3">
                                        <ShoppingBag size={16} className="text-slate-500" />
                                        <span>Quản lý Sản Phẩm</span>
                                    </div>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${openProductMenu ? 'rotate-180' : ''}`} />
                                </button>

                                {/* DANH SÁCH SUB-MENU CỦA SẢN PHẨM */}
                                {openProductMenu && (
                                    <div className="pl-9 mt-1 flex flex-col gap-0.5 border-l-2 border-slate-100 ml-5">
                                        <Link href="/seller/products" className={`flex items-center gap-2 py-2 px-2 text-xs rounded-lg transition ${pathname === '/seller/products' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'}`}>
                                            <Package size={13} /> Tất Cả Sản Phẩm
                                        </Link>
                                        <Link href="/seller/products/add" className={`flex items-center gap-2 py-2 px-2 text-xs rounded-lg transition ${pathname === '/seller/products/add' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'}`}>
                                            <Plus size={13} /> Thêm Sản Phẩm
                                        </Link>
                                        <Link href="/seller/products/inventory" className={`flex items-center gap-2 py-2 px-2 text-xs rounded-lg transition ${pathname === '/seller/products/inventory' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-900'}`}>
                                            <SlidersHorizontal size={13} /> Quản Lý Tồn Kho
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* 🌟 CỤM MENU CHA 2: QUẢN LÝ SHOP (PHÂN HỆ MỚI) */}
                            <div className="mt-1">
                                <button 
                                    onClick={() => setOpenShopMenu(!openShopMenu)}
                                    className="w-full flex items-center justify-between px-3 py-2.5 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition cursor-pointer select-none"
                                >
                                    <div className="flex items-center gap-3">
                                        <Store size={16} className="text-slate-500" />
                                        <span>Quản Lý Shop</span>
                                    </div>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${openShopMenu ? 'rotate-180' : ''}`} />
                                </button>

                                {/* DANH SÁCH SUB-MENU CỦA SHOP */}
                                {openShopMenu && (
                                    <div className="pl-9 mt-1 flex flex-col gap-0.5 border-l-2 border-slate-100 ml-5">
                                        <Link href="/seller/profile" className={`flex items-center gap-2 py-2 px-2 text-xs rounded-lg transition ${pathname === '/seller/profile' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'}`}>
                                            <User size={13} /> Hồ Sơ Cửa Hàng
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <Link href="/seller/orders" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${pathname === '/seller/orders' ? 'bg-slate-50 text-emerald-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                                <ClipboardList size={16} /> Đơn đặt hàng
                            </Link>
                        </nav>
                    </div>

                    <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-xs font-medium transition cursor-pointer mb-2"><LogOut size={16} /> Thoát Kênh người bán</button>
                </aside>

                <main className="flex-1 p-6 bg-slate-50/50">
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    );
}