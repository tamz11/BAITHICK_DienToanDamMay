'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function OrdersAreaChart({ allOrders, granularity = 'day' }) {

    // allOrders can be either:
    // - an array of { createdAt } order objects, or
    // - an array of pre-aggregated { date, revenue } entries returned by admin/dashboard
    let chartData = []

    if (Array.isArray(allOrders) && allOrders.length) {
        const first = allOrders[0]
        // If already aggregated (has `date`), use it directly (treat `revenue` as orders if needed)
        if (first && typeof first === 'object' && 'date' in first) {
            chartData = allOrders.map((d) => ({ date: d.date, orders: typeof d.revenue === 'number' ? d.revenue : (d.orders || 0) }))
        } else {
            // Otherwise expect order objects with createdAt; group by valid dates
            const ordersPerDay = allOrders.reduce((acc, order) => {
                const created = order?.createdAt || order?.created_at || order?.date
                const dt = new Date(created)
                if (isNaN(dt.getTime())) return acc // skip invalid dates
                const date = dt.toISOString().split('T')[0]
                acc[date] = (acc[date] || 0) + 1
                return acc
            }, {})
            chartData = Object.entries(ordersPerDay).map(([date, count]) => ({ date, orders: count }))
        }
    }

    const titleMap = { day: 'Ngày', month: 'Tháng', year: 'Năm' }
    return (
        <div className="w-full max-w-4xl h-[300px] text-xs">
            <h3 className="text-lg font-medium text-slate-800 mb-4 pt-2 text-right"> <span className='text-slate-500'>Đơn /</span> {titleMap[granularity] || 'Ngày'}</h3>
            <ResponsiveContainer width="100%" height="100%"> 
                <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} label={{ value: 'Số đơn', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="orders" stroke="#4f46e5" fill="#8884d8" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
