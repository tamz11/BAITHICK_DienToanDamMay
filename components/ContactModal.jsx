"use client"
import ContactForm from './ContactForm'

export default function ContactModal({ open, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-600">Đóng</button>
        <ContactForm />
      </div>
    </div>
  )
}
