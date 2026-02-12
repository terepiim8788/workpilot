'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date())

  // ===== SESSION =====
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoadingSession(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ===== LOAD EVENTS =====
  useEffect(() => {
    if (!session) return

    const loadEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('assigned_to', session.user.id)

      if (data) setEvents(data)
    }

    loadEvents()
  }, [session])

  // ===== WEEK CALC =====
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  const startOfWeek = getStartOfWeek(currentWeekStart)

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    return day
  })

  // 24h
  const hours = Array.from({ length: 24 }).map((_, i) => i)

  // ===== STATES =====
  if (loadingSession) {
    return (
      <div className="p-10 bg-gray-100 min-h-screen text-black">
        Loading...
      </div>
    )
  }

  if (!session) {
    return (
      <div className="p-10 bg-gray-100 min-h-screen text-black">
        Please login.
      </div>
    )
  }

  // ===== UI =====
  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          24h Weekly Calendar
        </h1>

        <button
          onClick={() => supabase.auth.signOut()}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* Week navigation */}
      <div className="flex gap-4 mb-6">
        <button
          className="px-4 py-2 bg-white border rounded font-semibold"
          onClick={() =>
            setCurrentWeekStart(
              new Date(currentWeekStart.getTime() - 7 * 86400000)
            )
          }
        >
          ◀ Previous
        </button>

        <button
          className="px-4 py-2 bg-white border rounded font-semibold"
          onClick={() =>
            setCurrentWeekStart(
              new Date(currentWeekStart.getTime() + 7 * 86400000)
            )
          }
        >
          Next ▶
        </button>
      </div>

      {/* Scrollable calendar */}
      <div className="bg-white rounded-xl shadow overflow-auto max-h-[75vh]">

        <div className="grid grid-cols-8 min-w-[1000px]">

          {/* Time column */}
          <div className="border-r bg-gray-50">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b px-3 text-sm flex items-start pt-2 text-gray-600"
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className="border-r last:border-r-0"
            >
              {/* Day header */}
              <div className="h-12 border-b flex items-center justify-center font-semibold bg-gray-50">
                {day.toLocaleDateString(undefined, {
                  weekday: 'short',
                  day: 'numeric',
                })}
              </div>

              {/* Hour cells */}
              {hours.map((hour) => {
                const dateString =
                  day.toISOString().split('T')[0]

                const matchingEvents = events.filter((event) => {
                  if (!event.start_date || !event.start_time)
                    return false

                  const eventHour = parseInt(
                    event.start_time.split(':')[0]
                  )

                  return (
                    event.start_date === dateString &&
                    eventHour === hour
                  )
                })

                return (
                  <div
                    key={hour}
                    className="h-16 border-b relative"
                  >
                    {matchingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="absolute inset-1 bg-blue-600 text-white text-xs rounded-lg p-2 shadow"
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
