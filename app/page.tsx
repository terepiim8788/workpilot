'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const HOUR_HEIGHT = 60

function format(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(new Date())

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

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  const start = getStartOfWeek(currentWeek)

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })

  const hours = Array.from({ length: 24 }).map((_, i) => i)

  if (loading) return <div>Loading...</div>
  if (!session) return <div>Please login.</div>

  return (
    <div style={{ padding: 30 }}>

      <h1>Weekly Calendar</h1>

      <div style={{ display: 'flex', marginTop: 20 }}>

        {/* Time column */}
        <div>
          {hours.map(h => (
            <div
              key={h}
              style={{
                height: HOUR_HEIGHT,
                borderBottom: '1px solid #ddd',
                width: 60
              }}
            >
              {String(h).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map(day => {
          const dayString = format(day)

          return (
            <div
              key={dayString}
              style={{
                borderLeft: '1px solid #ddd',
                position: 'relative',
                width: 150
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #ddd',
                  padding: 5
                }}
              >
                {dayString}
              </div>

              {hours.map(h => (
                <div
                  key={h}
                  style={{
                    height: HOUR_HEIGHT,
                    borderBottom: '1px solid #eee'
                  }}
                />
              ))}

              {events.map(e => {
  console.log("EVENT DATE:", e.start_date)
  console.log("DAY STRING:", dayString)
  return null
})}
                  const hour = parseInt(e.start_time.split(':')[0])
                  const minute = parseInt(e.start_time.split(':')[1])

                  const top =
                    hour * HOUR_HEIGHT +
                    (minute / 60) * HOUR_HEIGHT +
                    30 // header offset

                  const height =
                    (e.duration_hours || 1) * HOUR_HEIGHT

                  return (
                    <div
                      key={e.id}
                      style={{
                        position: 'absolute',
                        top,
                        left: 5,
                        right: 5,
                        height: height - 4,
                        background: '#2563eb',
                        color: 'white',
                        padding: 5,
                        borderRadius: 6,
                        fontSize: 12
                      }}
                    >
                      {e.title}
                    </div>
                  )
                })}
            </div>
          )
        })}

      </div>
    </div>
  )
}

