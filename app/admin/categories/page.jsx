'use client'
import { useEffect, useState } from 'react'
import Loading from '@/components/Loading'

export default function AdminCategories() {
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  const fetchCategories = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/categories')
    const data = await res.json()
    setCategories(data.categories || [])
    setLoading(false)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
    setName('')
    fetchCategories()
  }

  const startEdit = (id, currentName) => {
    setEditingId(id)
    setEditingName(currentName)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    if (!editingId) return
    await fetch('/api/admin/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, name: editingName }) })
    cancelEdit()
    fetchCategories()
  }

  const handleDelete = async (id) => {
    if (!confirm('Bạn chắc chắn muốn xóa danh mục này?')) return
    const res = await fetch('/api/admin/categories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    const data = await res.json()
    if (!res.ok) {
      // if category has products, ask to force delete (reassign products)
      if (data && data.error === 'Category has products') {
        if (confirm(`Danh mục đang có ${data.productsCount} sản phẩm. Xóa sẽ gán lại category của các sản phẩm rồi xóa. Tiếp tục?`)) {
          await fetch('/api/admin/categories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, force: true }) })
          fetchCategories()
          return
        }
      }
      alert(data?.error || 'Lỗi khi xóa')
      return
    }
    fetchCategories()
  }

  useEffect(() => { fetchCategories() }, [])

  if (loading) return <Loading />

  return (
    <div className="text-slate-500 mb-28">
      <h1 className="text-2xl">Quản lý <span className="text-slate-800 font-medium">Danh mục</span></h1>

      <form onSubmit={handleAdd} className="max-w-sm mt-4">
        <input className="w-full p-2 border border-slate-200 rounded" placeholder="Tên danh mục" value={name} onChange={(e)=>setName(e.target.value)} />
        <button className="mt-2 px-4 py-2 bg-slate-700 text-white rounded">Thêm</button>
      </form>

      <div className="mt-6">
        {categories.map((c) => (
          <section key={c.id} className="bg-white border rounded p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-slate-800">{c.name}</h3>
              <div className="space-x-2">
                <button className="text-xs px-2 py-1 border rounded" onClick={()=>startEdit(c.id, c.name)}>Sửa</button>
                <button className="text-xs px-2 py-1 border rounded text-red-600" onClick={()=>handleDelete(c.id)}>Xóa</button>
              </div>
            </div>
            {editingId === c.id ? (
              <form onSubmit={saveEdit} className="mb-3 flex gap-2">
                <input value={editingName} onChange={(e)=>setEditingName(e.target.value)} className="p-2 border rounded flex-1" />
                <button className="px-3 py-1 bg-slate-700 text-white rounded">Lưu</button>
                <button type="button" className="px-3 py-1 border rounded" onClick={cancelEdit}>Hủy</button>
              </form>
            ) : null}
            {c.products && c.products.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-500 border-b">
                      <th className="py-2 px-3">Ảnh</th>
                      <th className="py-2 px-3">Sản phẩm</th>
                      <th className="py-2 px-3">Cửa hàng</th>
                      <th className="py-2 px-3">Giá</th>
                      <th className="py-2 px-3">Trạng thái</th>
                      <th className="py-2 px-3">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.products.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-3 w-24">
                          <img src={Array.isArray(p.images) ? p.images[0] : (p.images || '')} alt={p.name} className="w-16 h-16 object-cover rounded" onError={(e)=>{e.target.onerror=null; e.target.src='/uploads/placeholder.png'}} />
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-slate-400">{p.description}</div>
                        </td>
                        <td className="py-3 px-3">{p.store?.name || p.store?.username || '—'}</td>
                        <td className="py-3 px-3">{p.price}</td>
                        <td className="py-3 px-3">{p.status}</td>
                        <td className="py-3 px-3">{p.createdAt ? new Date(p.createdAt).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-slate-400">Không có sản phẩm</div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
