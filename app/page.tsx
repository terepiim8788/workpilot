'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const HOUR_HEIGHT = 64
const HEADER_HEIGHT = 48

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [events, setEvents] = useState<any[]>([])

  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(1)
  const [error, setError] = useState('')

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

  const handleAddEvent = async () => {
    setError('')

    if (!title || !date || !time) {
      setError('All fields required')
      return
    }

    const { data, error } = await supabase
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

    if (error) {
      setError(error.message)
      return
    }

    if (data) {
      setEvents(prev => [...prev, ...data])
      setShowModal(false)
      setTitle('')
      setDate('')
      setTime('')
      setDuration(1)
    }
  }

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

  const hours = Array.from({ length: 24 }).map((_, i) => i)

  if (loadingSession) {
    return <div className="p-10 bg-gray-100 min-h-screen">Loading...</div>
  }

  if (!session) {
    return <div className="p-10 bg-gray-100 min-h-screen">Please login.</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Weekly Calendar</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Add Event
          </button>

          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* WEEK NAV */}
      <div className="flex gap-4 mb-4">
        <button
          className="px-4 py-2 bg-white border rounded"
          onClick={() =>
            setCurrentWeekStart(
              new Date(currentWeekStart.getTime() - 7 * 86400000)
            )
          }
        >
          ◀ Previous
        </button>

        <button
          className="px-4 py-2 bg-white border rounded"
          onClick={() =>
            setCurrentWeekStart(
              new Date(currentWeekStart.getTime() + 7 * 86400000)
            )
          }
        >
          Next ▶
        </button>
      </div>

      {/* CALENDAR */}
      <div className="bg-white rounded-xl shadow overflow-auto max-h-[75vh]">
        <div className="grid grid-cols-8 min-w-[1200px]">

          {/* TIME COLUMN */}
          <div className="border-r bg-gray-50">
            {hours.map(hour => (
              <div
                key={hour}
                className="h-16 border-b px-3 text-sm pt-2 text-gray-600"
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* DAYS */}
          {weekDays.map(day => {
            const dateString = day.toISOString().split('T')[0]

            return (
              <div key={dateString} className="border-r relative">

                {/* DAY HEADER */}
                <div
                  className="border-b flex items-center justify-center font-semibold bg-gray-50"
                  style={{ height: HEADER_HEIGHT }}
                >
                  {day.toLocaleDateString(undefined, {
                    weekday: 'short',
                    day: 'numeric',
                  })}
                </div>

                {/* GRID */}
                <div className="relative">
                  {hours.map(hour => (
                    <div
                      key={hour}
                      className="border-b"
                      style={{ height: HOUR_HEIGHT }}
                    />
                  ))}

                  {/* EVENTS */}
                  {events
                    .filter(e => e.start_date === dateString)
                    .map(event => {
                      const [h, m] = event.start_time.split(':')
                      const startHour = parseInt(h)
                      const startMinute = parseInt(m)

                      const top =
                        HEADER_HEIGHT +
                        startHour * HOUR_HEIGHT +
                        (startMinute / 60) * HOUR_HEIGHT

                      const height =
                        (event.duration_hours || 1) * HOUR_HEIGHT

                      return (
                        <div
                          key={event.id}
                          className="absolute left-1 right-1 bg-blue-600 text-white text-xs rounded-lg p-2 shadow"
                          style={{
                            top,
                            height: height - 4,
                          }}
                        >
                          {event.title}
                          <div className="text-[10px] opacity-80">
                            {event.start_time} ({event.duration_hours || 1}h)
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="text-lg font-bold mb-4">Add Event</h2>

            <input
              type="text"
              placeholder="Title"
              className="w-full border rounded p-2 mb-3"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />

            <input
              type="date"
              className="w-full border rounded p-2 mb-3"
              value={date}
              onChange={e => setDate(e.target.value)}
            />

            <input
              type="time"
              className="w-full border rounded p-2 mb-3"
              value={time}
              onChange={e => setTime(e.target.value)}
            />

            <select
              className="w-full border rounded p-2 mb-4"
              value={duration}
              onChange={e => setDuration(parseInt(e.target.value))}
            >
              {[1,2,3,4,5,6,7,8].map(d => (
                <option key={d} value={d}>{d} hour(s)</option>
              ))}
            </select>

            {error && (
              <p className="text-sm text-red-600 mb-3">{error}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleAddEvent}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
