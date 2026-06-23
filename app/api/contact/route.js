import { createZohoLead } from '@/lib/zoho'

async function trySendSmtpMail({ from, to, subject, text, html }) {
    try {
        const nodemailer = await import('nodemailer')
        const host = process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com'
        const port = parseInt(process.env.ZOHO_SMTP_PORT || '465', 10)
        const secure = port === 465

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user: process.env.ZOHO_SMTP_USER,
                pass: process.env.ZOHO_SMTP_PASS,
            }
        })

        const info = await transporter.sendMail({ from, to, subject, text, html })
        return { ok: true, info }
    } catch (err) {
        console.error('SMTP send error:', err)
        return { ok: false, error: String(err) }
    }
}

export async function POST(req) {
    try {
        const body = await req.json()
        const { name, email, subject, message } = body || {}

        if (!name || !email || !message) {
            return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 })
        }

        const parts = name.trim().split(' ')
        const firstName = parts.slice(0, -1).join(' ') || parts[0]
        const lastName = parts.slice(-1).join('') || ''

        const companyName = subject ? `${subject} - ${message.slice(0, 200)}` : message.slice(0, 200)

        // First, try to send via SMTP if SMTP credentials present
        const recipient = process.env.NEXT_PUBLIC_CONTACT_EMAIL || process.env.CONTACT_EMAIL || '65htttg11@techmart.app'

        if (process.env.ZOHO_SMTP_USER && process.env.ZOHO_SMTP_PASS) {
            const from = process.env.ZOHO_SMTP_USER
            const subjectLine = subject || `Liên hệ từ ${name}`
            const textBody = `Name: ${name}\nEmail: ${email}\nSubject: ${subject || ''}\n\nMessage:\n${message}`

            const smtpRes = await trySendSmtpMail({ from, to: recipient, subject: subjectLine, text: textBody })
            if (!smtpRes.ok) {
                // fallback to creating Zoho lead
                const lead = await createZohoLead(lastName, firstName, email, '', companyName)
                return new Response(JSON.stringify({ ok: false, smtpError: smtpRes.error, zoho: lead }), { status: 502 })
            }

            // Optionally also create CRM lead
            await createZohoLead(lastName, firstName, email, '', companyName)

            // In development return detailed smtp info for debugging
            if (process.env.NODE_ENV !== 'production') {
                return new Response(JSON.stringify({ ok: true, sent: true, via: 'smtp', info: smtpRes.info || null }), { status: 200 })
            }

            return new Response(JSON.stringify({ ok: true, sent: true, via: 'smtp' }), { status: 200 })
        }

        // If no SMTP, fallback to creating Zoho CRM lead
        const result = await createZohoLead(lastName, firstName, email, '', companyName)

        if (!result) {
            return new Response(JSON.stringify({ error: 'Zoho CRM request failed. Check Zoho credentials (ZOHO_CRM_REFRESH_TOKEN, client id/secret).' }), { status: 502 })
        }

        return new Response(JSON.stringify({ ok: true, zoho: result }), { status: 200 })
    } catch (err) {
        console.error('Contact API Error:', err)
        return new Response(JSON.stringify({ error: 'Server error', detail: String(err) }), { status: 500 })
    }
}
