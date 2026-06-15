'use client'
import { useEffect, useState } from 'react'
import Loading from '@/components/Loading'
import { productDummyData, orderDummyData } from '@/assets/assets'
import toast from 'react-hot-toast'

export default function StaffPage() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('products')

  useEffect(() => {
    // Load dummy data; swap for API calls when backend available
    setProducts(productDummyData)
    setOrders(orderDummyData)
    setLoading(false)
  }, [])

  const pendingProducts = products.filter(p => !p.status || p.status === 'PENDING')

  const handleApproveProduct = async (productId, decision) => {
    // Replace with API call: PATCH /api/staff/products/:id
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: decision === 'approved' ? 'APPROVED' : 'REJECTED' } : p))
    toast.success(`${decision === 'approved' ? 'Đã duyệt' : 'Đã từ chối'} sản phẩm`)
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      // Call backend API to persist status change. This endpoint requires auth.
      await fetch(`/api/staff/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' /*, Authorization: 'Bearer <token>' */ },
        body: JSON.stringify({ status })
      })
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
      toast.success(`Cập nhật trạng thái: ${status}`)
    } catch (err) {
      console.error(err)
      toast.error('Không thể cập nhật trạng thái. Kiểm tra kết nối.')
    }
  }

  const filteredOrders = orders.filter(o => o.user?.name?.toLowerCase().includes(query.toLowerCase()) || o.id.includes(query))

  if (loading) return <Loading />

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl text-slate-700 mb-4">Nhân viên <span className="font-medium text-slate-900"></span></h1>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex gap-2">
          <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded ${activeTab === 'products' ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>
            Duyệt sản phẩm
          </button>
          <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded ${activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>
            Đơn hàng
          </button>
          <button onClick={() => setActiveTab('support')} className={`px-4 py-2 rounded ${activeTab === 'support' ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>
            Hỗ trợ
          </button>
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'products' && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Duyệt sản phẩm</h2>
          {pendingProducts.length === 0 ? (
            <p className="text-slate-500">Không có sản phẩm chờ duyệt.</p>
          ) : (
            <div className="space-y-4">
              {pendingProducts.map(p => (
                <div key={p.id} className="p-4 bg-white border rounded shadow-sm flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img src={p.images?.[0]} alt={p.name} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-slate-500">{p.category} • ${p.price}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApproveProduct(p.id, 'approved')} className="px-3 py-2 bg-green-600 text-white rounded">Duyệt</button>
                    <button onClick={() => handleApproveProduct(p.id, 'rejected')} className="px-3 py-2 bg-slate-500 text-white rounded">Từ chối</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'orders' && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Kiểm tra đơn hàng</h2>

          <div className="mb-3 flex items-center gap-3">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm kiếm theo tên khách hoặc id" className="border px-3 py-2 rounded w-64" />
          </div>

          {filteredOrders.length === 0 ? (
            <p className="text-slate-500">Không có đơn hàng.</p>
          ) : (
            <div className="overflow-x-auto rounded-md shadow border border-gray-200">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
                  <tr>
                    {['Sr. No.', 'Customer', 'Total', 'Payment', 'Status', 'Date'].map((h,i) => (
                      <th key={i} className="px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order, idx) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="pl-6 text-green-600">{idx+1}</td>
                      <td className="px-4 py-3">{order.user?.name}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">${order.total}</td>
                      <td className="px-4 py-3">{order.paymentMethod}</td>
                      <td className="px-4 py-3">
                        <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)} className="border-gray-300 rounded-md text-sm">
                          <option value="ORDER_PLACED">ORDER_PLACED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'support' && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Hỗ trợ khách hàng</h2>

          <SupportPanel />
        </section>
      )}
    </div>
  )
}

function SupportPanel() {
  const [tickets, setTickets] = useState([])
  const [selected, setSelected] = useState(null)
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [messageText, setMessageText] = useState('')

  useEffect(() => { fetchTickets() }, [])

  async function fetchTickets() {
    setLoadingTickets(true)
    try {
      const res = await fetch('/api/support/tickets')
      if (!res.ok) throw new Error('Failed to fetch tickets')
      const data = await res.json()
      setTickets(data.tickets || [])
    } catch (err) {
      console.error('Error fetching tickets:', err)
      setTickets([])
    } finally {
      setLoadingTickets(false)
    }
  }


  async function openTicket(id) {
    const res = await fetch(`/api/support/tickets/${id}`)
    if (!res.ok) return
    const data = await res.json()
    setSelected(data.ticket)
  }

  async function sendMessage() {
    if (!selected || !messageText) return
    const res = await fetch(`/api/support/tickets/${selected.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ author: 'Staff', text: messageText, byStaff: true }) })
    if (res.ok) {
      setMessageText('')
      // refresh selected ticket
      await openTicket(selected.id)
      await fetchTickets()
    }
  }

  if (loadingTickets) return <p>Đang tải ticket...</p>

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1">
        <div className="space-y-2">
          {tickets.map(t => (
            <div key={t.id} onClick={() => openTicket(t.id)} className={`p-3 rounded border cursor-pointer ${selected?.id === t.id ? 'bg-indigo-50' : 'bg-white'}`}>
              <div className="flex justify-between">
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-slate-500">{t.status}</div>
              </div>
              <div className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-2">
        {!selected ? (
          <div className="p-6 bg-white border rounded">Chọn ticket để xem chi tiết và chat.</div>
        ) : (
          <div className="p-4 bg-white border rounded flex flex-col h-[60vh]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{selected.title}</h3>
                <div className="text-xs text-slate-500">{selected.user?.name} • {selected.status}</div>
              </div>
              <div>
                <button onClick={async () => { await fetch(`/api/support/tickets/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'CLOSED' }) }); openTicket(selected.id); fetchTickets(); }} className="px-3 py-1 bg-slate-500 text-white rounded text-sm">Đóng</button>
              </div>
            </div>

            <div className="flex-1 overflow-auto mb-3 space-y-2">
              {selected.messages.map(m => (
                <div key={m.id} className={`p-2 rounded ${m.author === 'Staff' ? 'bg-indigo-100 self-end' : 'bg-gray-100'}`}>
                  <div className="text-xs text-slate-600">{m.author} • {new Date(m.createdAt).toLocaleString()}</div>
                  <div>{m.text}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input value={messageText} onChange={e => setMessageText(e.target.value)} placeholder="Nhập tin nhắn" className="border px-3 py-2 rounded flex-1" />
              <button onClick={sendMessage} className="px-4 py-2 bg-green-600 text-white rounded">Gửi</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
