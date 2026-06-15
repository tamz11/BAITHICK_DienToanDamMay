import { promises as fs } from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data', 'tickets.json')

export async function GET(req, { params }) {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8')
    const tickets = JSON.parse(raw || '[]')
    const ticket = tickets.find(t => t.id === params.ticketId)
    if (!ticket) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    return new Response(JSON.stringify({ ticket }))
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const body = await req.json()
    const { author, text } = body
    if (!author || !text) return new Response(JSON.stringify({ error: 'Missing' }), { status: 400 })

    const raw = await fs.readFile(DATA_PATH, 'utf-8')
    const tickets = JSON.parse(raw || '[]')
    const idx = tickets.findIndex(t => t.id === params.ticketId)
    if (idx === -1) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })

    const message = { id: `m_${Date.now()}`, author, text, createdAt: new Date().toISOString() }
    tickets[idx].messages.push(message)
    // If staff posts, mark as in-progress
    if (body.byStaff) tickets[idx].status = 'IN_PROGRESS'
    await fs.writeFile(DATA_PATH, JSON.stringify(tickets, null, 2))
    return new Response(JSON.stringify({ message }), { status: 201 })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  try {
    const body = await req.json()
    const { status } = body
    if (!status) return new Response(JSON.stringify({ error: 'Missing' }), { status: 400 })

    const raw = await fs.readFile(DATA_PATH, 'utf-8')
    const tickets = JSON.parse(raw || '[]')
    const idx = tickets.findIndex(t => t.id === params.ticketId)
    if (idx === -1) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })

    tickets[idx].status = status
    await fs.writeFile(DATA_PATH, JSON.stringify(tickets, null, 2))
    return new Response(JSON.stringify({ ticket: tickets[idx] }))
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
