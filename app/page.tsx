'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date())
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // SESSION
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

  // LOAD EVENTS
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

  const handleLogin = async () => {
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) setError(error.message)
  }

  const handleRegister = async () => {
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) setError(error.message)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const hours = Array.from({ length: 24 }).map((_, i) => i)

  if (loadingSession) {
    return <div className="p-10 bg-gray-100 min-h-screen">Loading...</div>
  }

  // 🔐 LOGIN UI
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
            className="w-full border border-gray-300 rounded-lg p-3 mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded-lg p-3 mb-4"
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
            className="w-full border border-gray-300 py-3 rounded-lg"
          >
            Register
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-600 text-center">
              {error}
            </p>
          )}
        </div>
      </div>
    )
  }

  // 📅 CALENDAR
  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          24h Weekly Calendar
        </h1>

        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

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

          {/* 7 empty day columns for now */}
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="border-r last:border-r-0">
              {hours.map((hour) => (
                <div key={hour} className="h-16 border-b"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
