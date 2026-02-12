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
  const [events, setEvents] = useState<any[]>([])
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date())

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

  if (!session) {
    return <div className="p-10">Login first...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Drag & Drop Calendar
      </h1>

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
