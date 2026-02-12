'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    }

    setLoading(false)
  }

  const handleRegister = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email to confirm.')
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Welcome to WorkPilot
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
            className="w-full bg-black text-white py-3 rounded-lg mb-3 hover:opacity-90"
            disabled={loading}
          >
            Login
          </button>

          <button
            onClick={handleRegister}
            className="w-full border py-3 rounded-lg hover:bg-gray-100"
            disabled={loading}
          >
            Register
          </button>

          {message && (
            <p className="mt-4 text-sm text-center text-red-500">
              {message}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-2">
            Welcome back
          </h2>
          <p className="text-sm text-gray-600">
            Logged in as {session.user.email}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-2">
            Team Overview
          </h2>
          <p className="text-sm text-gray-600">
            Manage your team schedules efficiently.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-2">
            Calendar
          </h2>
          <p className="text-sm text-gray-600">
            Plan and assign work across your organization.
          </p>
        </div>

      </div>
    </div>
  )
}
