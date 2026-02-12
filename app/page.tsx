'use client'

import { useEffect, useState } from 'react'
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
} from '@dnd-kit/core'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date())
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) setMessage(error.message)
  }

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email to confirm.')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const eventId = active.id
    const newDate = over.id

    await supabase
      .from('events')
      .update({ start_date: newDate })
      .eq('id', eventId)

    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, start_date: newDate } : e
      )
    )
  }

  // LOADING
  if (loadingSession) {
    return <div className="p-10">Loading...</div>
  }

  // LOGIN UI
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
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
            className="w-full bg-black text-white py-3 rounded-lg mb-3"
          >
            Login
          </button>

          <button
            onClick={handleRegister}
            className="w-full border py-3 rounded-lg"
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

  // DASHBOARD
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Drag & Drop Calendar
        </h1>

        <button
          onClick={handleLogout}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={() =>
            setCurrentWeekStart(
              new Date(currentWeekStart.getTime() - 7 * 86400000)
            )
          }
        >
          ◀
        </button>
        <button
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={() =>
            setCurrentWeekStart(
              new Date(currentWeekStart.getTime() + 7 * 86400000)
            )
          }
        >
          ▶
        </button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => (
            <DayColumn
              key={day.toISOString()}
              day={day}
              events={events}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}

function DayColumn({
  day,
  events,
}: {
  day: Date
  events: any[]
}) {
  const dateString = day.toISOString().split('T')[0]

  const { setNodeRef } = useDroppable({
    id: dateString,
  })

  const dayEvents = events.filter((event) => {
    if (!event.start_date) return false
    return event.start_date.startsWith(dateString)
  })

  return (
    <div
      ref={setNodeRef}
      className="bg-white p-4 rounded-xl shadow min-h-[200px]"
    >
      <h2 className="font-semibold mb-3">
        {day.toLocaleDateString(undefined, {
          weekday: 'short',
          day: 'numeric',
        })}
      </h2>

      {dayEvents.map((event) => (
        <DraggableEvent key={event.id} event={event} />
      ))}
    </div>
  )
}

function DraggableEvent({ event }: { event: any }) {
  const { attributes, listeners, setNodeRef, transform } =
    useDraggable({
      id: event.id,
    })

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-black text-white p-2 rounded mb-2 cursor-grab text-sm"
    >
      {event.title}
    </div>
  )
}
