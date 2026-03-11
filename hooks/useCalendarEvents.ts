import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function useCalendarEvents() {
  const [session, setSession] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
  }, [])

  useEffect(() => {
    if (!session) return

    supabase
      .from('events')
      .select('*')
      .eq('assigned_to', session.user.id)
      .then(({ data }) => {
        if (data) setEvents(data)
      })
  }, [session])

  const addEvent = async ({ title, date, time, duration }) => {
    const { data } = await supabase
      .from('events')
      .insert([
        {
          title,
          start_date: date,
          start_time: time,
          duration_hours: duration,
          assigned_to: session.user.id,
        },
      ])
      .select()

    if (data) setEvents(prev => [...prev, ...data])
  }

  const updateEvent = async (id, { title, date, time, duration }) => {
    const { data } = await supabase
      .from('events')
      .update({
        title,
        start_date: date,
        start_time: time,
        duration_hours: duration,
      })
      .eq('id', id)
      .select()

    if (data) {
      setEvents(prev =>
        prev.map(e => (e.id === id ? data[0] : e))
      )
    }
  }

  const deleteEvent = async (id) => {
    await supabase.from('events').delete().eq('id', id)
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  return {
    session,
    events,
    addEvent,
    updateEvent,
    deleteEvent,
  }
}
