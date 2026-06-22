'use client'
import { useEffect, useState } from 'react'
import Loading from '@/components/Loading'

export default function AdminUsers() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')

  const fetchUsers = async (q) => {
    setLoading(true)
    const url = q ? `/api/admin/users?q=${encodeURIComponent(q)}` : '/api/admin/users'
    const res = await fetch(url, { credentials: 'include' })
    const data = await res.json()
    if (!res.ok) {
      console.error('Failed to fetch users', data)
      setUsers([])
    } else {
      setUsers(data.users || [])
    }
    setLoading(false)
  }

  const toggleActive = async (user) => {
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId: user.id, isActive: !user.isActive })
    })
    const data = await res.json()
    if (!res.ok) console.error('Update user failed', data)
    fetchUsers()
  }

  const deleteUser = async (user) => {
    if (!confirm(`Xóa người dùng ${user.email}? Hành động này không thể hoàn tác.`)) return
    const res = await fetch('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ userId: user.id }) })
    const data = await res.json()
    if (!res.ok) return alert(data?.error || 'Lỗi khi xóa')
    fetchUsers()
  }

  useEffect(() => { fetchUsers() }, [])

  if (loading) return <Loading />

  return (
    <div className="text-slate-500 mb-32">
      <h1 className="text-2xl">Quản lý <span className="text-slate-800 font-medium">Người dùng</span></h1>

      <div className="mt-4 max-w-sm">
        <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Tìm theo tên hoặc email" className="w-full p-2 border rounded" />
        <div className="mt-2 flex gap-2">
          <button className="px-3 py-1 bg-slate-700 text-white rounded" onClick={()=>fetchUsers(query)}>Tìm</button>
          <button className="px-3 py-1 border rounded" onClick={()=>{setQuery(''); fetchUsers('')}}>Reset</button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 max-w-4xl">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-slate-600">Tên</th>
              <th className="py-3 px-4 text-left font-semibold text-slate-600">Email</th>
              <th className="py-3 px-4 text-left font-semibold text-slate-600">Vai trò</th>
              <th className="py-3 px-4 text-left font-semibold text-slate-600">Hoạt động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-medium text-slate-800">{u.name}</td>
                <td className="py-3 px-4 text-slate-800">{u.email}</td>
                <td className="py-3 px-4 text-slate-800">{u.role}</td>
                <td className="py-3 px-4 text-slate-800">
                  <div className="flex items-center gap-3">
                    <button className="px-2 py-1 text-xs border rounded" onClick={() => toggleActive(u)}>{u.isActive ? 'Chặn' : 'Mở'}</button>
                    <button className="px-2 py-1 text-xs border rounded text-red-600" onClick={() => deleteUser(u)}>Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
