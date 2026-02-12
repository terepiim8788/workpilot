'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!session) return

    const load = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('assigned_to', session.user.id)

      if (data) setEvents(data)
    }

    load()
  }, [session])

  if (loading) return <div>Loading...</div>
  if (!session) return <div>Please login.</div>

  return (
    <div style={{ padding: 40 }}>
      <h1>My Events</h1>

      {events.length === 0 && <p>No events yet</p>}

      {events.map(e => (
        <div key={e.id} style={{
          border: '1px solid #ccc',
          padding: 10,
          marginBottom: 10
        }}>
          <strong>{e.title}</strong>
          <div>{e.start_date}</div>
          <div>{e.start_time}</div>
          <div>{e.duration_hours}h</div>
        </div>
      ))}
    </div>
  )
}
