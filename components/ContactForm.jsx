"use client"
import { useState } from 'react'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      })
      const data = await res.json().catch(()=>null)
      if (res.ok) {
        setStatus('success')
        setName('')
        setEmail('')
        setSubject('')
        setMessage('')
        setErrorMsg('')
      } else {
        setStatus('error')
        setErrorMsg(data?.error || data?.message || JSON.stringify(data) || 'Unknown error')
      }
    } catch (err) {
      setStatus('error')
      setErrorMsg(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
      <h1 className="text-2xl font-bold mb-2">Liên hệ với chúng tôi</h1>
      <p className="text-sm text-slate-600 mb-6">Gửi ý kiến, câu hỏi hoặc phản hồi — chúng tôi sẽ liên hệ lại sớm nhất.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Họ tên</label>
            <input required value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tiêu đề</label>
          <input value={subject} onChange={e=>setSubject(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nội dung</label>
          <textarea required value={message} onChange={e=>setMessage(e.target.value)} rows={6} className="w-full border rounded px-3 py-2" />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="px-5 py-2 bg-indigo-600 text-white rounded">
            {loading ? 'Đang gửi...' : 'Gửi liên hệ'}
          </button>
          {status === 'success' && <span className="text-green-600">Gửi thành công! Chúng tôi sẽ liên hệ lại.</span>}
          {status === 'error' && <span className="text-red-600">Gửi thất bại. {errorMsg || 'Vui lòng thử lại sau.'}</span>}
        </div>
      </form>
    </div>
  )
}
