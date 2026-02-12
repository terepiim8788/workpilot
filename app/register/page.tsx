'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Register() {
  const searchParams = useSearchParams()

  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = searchParams.get('token')
    setToken(t)
  }, [searchParams])

  const handleRegister = async () => {
    if (!token) {
      setMessage('Invalid invite link.')
      return
    }

    setLoading(true)

    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*')
      .eq('token', token)
      .eq('accepted', false)
      .single()

    if (inviteError || !invite) {
      setMessage('Invite not found or already used.')
      setLoading(false)
      return
    }

    if (invite.email !== email) {
      setMessage('Email does not match invite.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Account created! You can now login.')
    }

    setLoading(false)
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading invite...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 shadow rounded w-96">
        <h1 className="text-xl font-bold mb-4">
          Register via Invite
        </h1>

        <input
          type="email"
          placeholder="Email (must match invite)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 mb-3 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 mb-3 rounded"
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? 'Creating...' : 'Register'}
        </button>

        {message && (
          <p className="mt-4 text-sm text-gray-700">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
