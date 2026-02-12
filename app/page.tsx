'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [events, setEvents] = useState<any[]>([])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [eventError, setEventError] = useState('')

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
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('assigned_to', session.user.id)

      if (!error && data) {
        setEvents(data)
      }
    }

    loadEvents()
  }, [session])

  // ===== AUTH =====
  const handleLogin = async () => {
    setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) setAuthError(error.message)
  }

  const handleRegister = async () => {
    setAuthError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) setAuthError(error.message)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // ===== ADD EVENT =====
  const handleAddEvent = async () => {
    setEventError('')

    if (!title || !date || !time) {
      setEventError('All fields are required')
      return
    }

    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          title,
          start_date: date,
          start_time: time,
          assigned_to: session.user.id,
        },
      ])
      .select()

    if (error) {
      setEventError(error.message)
      return
    }

    if (data) {
      setEvents([...events, ...data])
      setShowModal(false)
      setTitle('')
      setDate('')
      setTime('')
    }
  }

  // ===== HOURS =====
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-black">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">
            WorkPilot Login
          </h1>

          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-lg p-3 mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg p-3 mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg mb-3"
          >
            Login
          </button>

          <button
            onClick={handleRegister}
            className="w-full border py-3 rounded-lg"
          >
            Register
          </button>

          {authError && (
            <p className="mt-4 text-sm text-red-600 text-center">
              {authError}
            </p>
          )}
        </div>
      </div>
    )
  }

  // ===== CALENDAR =====
  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          24h Calendar
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Add Event
          </button>

          <button
            onClick={handleLogout}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-auto max-h-[75vh]">
        <div className="grid grid-cols-2 border">

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

          {/* Event column */}
          <div>
            {hours.map((hour) => {
              const matching = events.filter((event) => {
                if (!event.start_time) return false
                return (
                  parseInt(event.start_time.split(':')[0]) === hour
                )
              })

              return (
                <div key={hour} className="h-16 border-b relative">
                  {matching.map((event) => (
                    <div
                      key={event.id}
                      className="absolute inset-1 bg-blue-600 text-white text-xs rounded-lg p-2 shadow"
                    >
                      {event.title}
                      <div className="text-[10px] opacity-80">
                        {event.start_time}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>

        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="text-lg font-bold mb-4">
              Add Event
            </h2>

            <input
              type="text"
              placeholder="Title"
              className="w-full border rounded p-2 mb-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              type="date"
              className="w-full border rounded p-2 mb-3"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <input
              type="time"
              className="w-full border rounded p-2 mb-4"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />

            {eventError && (
              <p className="text-sm text-red-600 mb-3">
                {eventError}
              </p>
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
