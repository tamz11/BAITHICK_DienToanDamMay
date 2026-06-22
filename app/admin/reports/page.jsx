'use client'
import { useEffect, useState } from 'react'
import Loading from '@/components/Loading'

export default function AdminReports() {
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(null)

  const orderStatusLabels = {
    ORDER_PLACED: 'Đã đặt',
    PROCESSING: 'Đang xử lý',
    SHIPPED: 'Đang giao',
    DELIVERED: 'Đã giao',
    CANCELLED: 'Đã huỷ'
  }

  const productStatusLabels = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Bị từ chối'
  }

  const getImageUrl = (img) => {
    if (!img) return '/placeholder.png'
    if (typeof img === 'string') {
      const trimmed = img.trim()
      if (!trimmed || trimmed === 'null') return '/placeholder.png'
      try {
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          const parsed = JSON.parse(trimmed)
          const first = parsed[0]
          const result = typeof first === 'object' ? first?.src : first
          return result || '/placeholder.png'
        }
      } catch (e) {}
      return trimmed
    }
    return img?.src || '/placeholder.png'
  }

  const fetchReport = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/reports')
    const data = await res.json()
    setReport(data)
    setLoading(false)
  }

  useEffect(() => { fetchReport() }, [])

  if (loading) return <Loading />

  return (
    <div className="text-slate-500 mb-28">
      <h1 className="text-2xl">Báo cáo</h1>

      <div className="mt-6 max-w-2xl">
        <div className="bg-white p-4 border rounded mb-4">
          <p className="text-sm text-slate-600">Tổng doanh thu</p>
          <b className="text-2xl">{report?.totalRevenue || 0}</b>
        </div>

        <div className="bg-white p-4 border rounded">
          <p className="text-sm text-slate-600">Doanh thu theo ngày</p>
          <ul className="mt-2">
            {report?.byDay?.map(d => (
              <li key={d.date} className="text-sm py-1">{d.date}: {d.revenue}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 border rounded mt-4">
          <p className="text-sm text-slate-600">Bán hàng theo cửa hàng</p>
          {!report?.salesByStore || !report.salesByStore.length ? (
            <div className="text-sm text-slate-400 mt-2">Chưa có dữ liệu bán hàng</div>
          ) : (
            <div className="mt-3 space-y-6">
              {report.salesByStore.map(s => (
                <div key={s.store.id} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={s.store.logo || '/placeholder.png'} alt={s.store.name} className="w-12 h-12 object-cover rounded" />
                      <div>
                        <div className="font-medium text-slate-800">{s.store.name} (@{s.store.username})</div>
                        <div className="text-xs text-slate-500">{s.products?.length || 0} sản phẩm đã bán</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-sm bg-white">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="py-2 px-3 text-left">Ảnh</th>
                          <th className="py-2 px-3 text-left">Sản phẩm</th>
                          <th className="py-2 px-3 text-left">Số lượng</th>
                          <th className="py-2 px-3 text-left">Trạng thái SP</th>
                          <th className="py-2 px-3 text-left">Đã đặt</th>
                          <th className="py-2 px-3 text-left">Đang xử lý</th>
                          <th className="py-2 px-3 text-left">Đang giao</th>
                          <th className="py-2 px-3 text-left">Đã giao</th>
                          <th className="py-2 px-3 text-left">Đã huỷ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {s.products.map(p => (
                          <tr key={p.productId} className="">
                            <td className="py-2 px-3">
                              <a href={getImageUrl(p.images ? (Array.isArray(p.images) ? p.images[0] : p.images) : null)} target="_blank" rel="noreferrer">
                                <img src={getImageUrl(p.images ? (Array.isArray(p.images) ? p.images[0] : p.images) : null)} alt={p.name} className="w-12 h-12 object-cover rounded hover:scale-105 transition-transform" onError={(e)=>{e.target.onerror=null; e.target.src='/placeholder.png'}} />
                              </a>
                            </td>
                            <td className="py-2 px-3 font-medium text-slate-800">{p.name}</td>
                            <td className="py-2 px-3">{p.quantity}</td>
                            <td className="py-2 px-3">{productStatusLabels[p.productStatus] || p.productStatus || 'N/A'}</td>
                            <td className="py-2 px-3">{p.orderStatusCounts?.ORDER_PLACED || 0}</td>
                            <td className="py-2 px-3">{p.orderStatusCounts?.PROCESSING || 0}</td>
                            <td className="py-2 px-3">{p.orderStatusCounts?.SHIPPED || 0}</td>
                            <td className="py-2 px-3">{p.orderStatusCounts?.DELIVERED || 0}</td>
                            <td className="py-2 px-3">{p.orderStatusCounts?.CANCELLED || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
