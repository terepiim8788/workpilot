import { useEffect, useState } from "react"
import { CalendarEvent } from "@/app/calendar/page"

export default function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [session, setSession] = useState<any>(null)

  // Load events on mount
  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/events")
      const data = await res.json()
      setEvents(data)
    }
    load()
  }, [])

  const addEvent = async ({
    title,
    date,
    time,
    duration,
  }: {
    title: string
    date: string
    time: string
    duration: number
  }) => {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        start_date: date,
        start_time: time,
        duration_hours: duration,
      }),
    })

    if (res.ok) {
      const newEvent = await res.json()
      setEvents((prev) => [...prev, newEvent])
    }
  }

  const deleteEvent = async (id: string) => {
    const res = await fetch(`/api/events/${id}`, {
      method: "DELETE",
    })

    if (res.ok) {
      setEvents((prev) => prev.filter((ev) => ev.id !== id))
    }
  }

  return {
    session,
    events,
    setEvents,
    addEvent,
    deleteEvent,
  }
}
