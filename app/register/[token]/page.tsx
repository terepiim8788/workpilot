'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function RegisterPage({
  params,
}: {
  params: { token: string }
}) {
  const token = params.token

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

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

  return (
    <div style={{ padding: 40 }}>
      <h1>Register via Invite</h1>

      <input
        type="email"
        placeholder="Email (must match invite)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleRegister} disabled={loading}>
        {loading ? 'Creating...' : 'Register'}
      </button>

      {message && <p>{message}</p>}
    </div>
  )
}
