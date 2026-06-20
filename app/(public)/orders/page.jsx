'use client'
import PageTitle from "@/components/PageTitle"
import { useEffect, useState } from "react";
import OrderItem from "@/components/OrderItem";

export default function Orders() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/orders');
            if (!response.ok) {
                throw new Error('Lỗi lấy danh sách đơn hàng');
            }
            const data = await response.json();
            setOrders(data.data || []);
            setError(null);
        } catch (err) {
            console.error('Fetch orders error:', err);
            setError(err.message);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] mx-6">
            {loading ? (
                <div className="min-h-[80vh] flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-slate-500">Đang tải đơn hàng...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="min-h-[80vh] flex items-center justify-center">
                    <div className="text-center text-red-500">
                        <p className="text-xl font-semibold mb-2">Lỗi</p>
                        <p>{error}</p>
                    </div>
                </div>
            ) : orders.length > 0 ? (
                (
                    <div className="my-20 max-w-7xl mx-auto">
                        <PageTitle heading="Các đơn hàng của tôi" text={`Tổng cộng ${orders.length} đơn hàng`} linkText={'Về trang chủ'} />

                        <table className="w-full max-w-5xl text-slate-500 table-auto border-separate border-spacing-y-12 border-spacing-x-4">
                            <thead>
                                <tr className="max-sm:text-sm text-slate-600 max-md:hidden">
                                    <th className="text-left">Sản phẩm</th>
                                    <th className="text-center">Tổng giá</th>
                                    <th className="text-left">Địa chỉ</th>
                                    <th className="text-left">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <OrderItem order={order} key={order.id} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                    <h1 className="text-2xl sm:text-4xl font-semibold">Bạn chưa có đơn hàng nào</h1>
                </div>
            )}
        </div>
    )
}