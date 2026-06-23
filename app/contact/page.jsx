import ContactForm from '@/components/ContactForm'

export const metadata = {
  title: 'Liên hệ'
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-5xl mx-auto px-6">
        <section className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Gửi phản hồi hoặc câu hỏi</h2>
          <p className="text-slate-600 mt-2">Chúng tôi trân trọng mọi góp ý — điền form bên dưới và chúng tôi sẽ liên hệ lại.</p>
        </section>

        <ContactForm />
      </div>
    </main>
  )
}
