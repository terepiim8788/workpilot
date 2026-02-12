'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Register() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleRegister = async () => {
    if (!token) {
      setMessage('Invalid invite link.')
      return
    }

    const { data: invite } = await supabase
      .from('invites')
      .select('*')
      .eq('token', token)
      .eq('accepted', false)
      .single()

    if (!invite) {
      setMessage('Invite not found or already used.')
      return
    }

    if (invite.email !== email) {
      setMessage('Email does not match invite.')
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
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Register via Invite</h1>

      <input
        type="email"
        placeholder="Email (must match invite)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', marginBottom: 10 }}
      />

      <button onClick={handleRegister}>
        Register
      </button>

      <p>{message}</p>
    </div>
  )
}
