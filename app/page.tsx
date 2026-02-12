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
    if (error) setMessage(error.message)
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

  if (loadingSession) {
    return (
      <div className="p-10 text-black bg-gray-100 min-h-screen">
        Loading...
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-black">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-black">
            WorkPilot Login
          </h1>

          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg mb-3 hover:bg-blue-700"
          >
            Login
          </button>

          <button
            onClick={handleRegister}
            className="w-full border border-gray-400 py-3 rounded-lg hover:bg-gray-100 text-black"
          >
            Register
          </button>

          {message && (
            <p className="mt-4 text-sm text-center text-red-600">
              {message}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">
          Calendar
        </h1>

        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          className="px-4 py-2 bg-white border border-gray-400 rounded text-black font-semibold"
          onClick={() =>
            setCurrentWeekStart(
              new Date(currentWeekStart.getTime() - 7 * 86400000)
            )
          }
        >
          ◀ Previous
        </button>

        <button
          className="px-4 py-2 bg-white border border-gray-400 rounded text-black font-semibold"
          onClick={() =>
            setCurrentWeekStart(
              new Date(currentWeekStart.getTime() + 7 * 86400000)
            )
          }
        >
          Next ▶
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
      className="bg-white p-4 rounded-xl shadow border min-h-[220px]"
    >
      <h2 className="font-semibold mb-3 text-black">
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
      className="bg-blue-600 text-white p-2 rounded-lg mb-2 cursor-grab text-sm shadow"
    >
      {event.title}
    </div>
  )
}
