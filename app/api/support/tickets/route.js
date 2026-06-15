import { promises as fs } from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data', 'tickets.json')

export async function GET(req) {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8')
    const tickets = JSON.parse(raw || '[]')
    return new Response(JSON.stringify({ tickets }))
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ tickets: [] }))
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { title, user } = body
    if (!title || !user) return new Response(JSON.stringify({ error: 'Missing' }), { status: 400 })

    const raw = await fs.readFile(DATA_PATH, 'utf-8')
    const tickets = JSON.parse(raw || '[]')
    const id = `t_${Date.now()}`
    const ticket = { id, title, user, status: 'OPEN', createdAt: new Date().toISOString(), messages: [] }
    tickets.unshift(ticket)
    await fs.writeFile(DATA_PATH, JSON.stringify(tickets, null, 2))
    return new Response(JSON.stringify({ ticket }), { status: 201 })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
