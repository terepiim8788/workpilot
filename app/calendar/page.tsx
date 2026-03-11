"use client"

import { useState } from "react"
import CalendarHeader from "@/components/CalendarHeader"
import MonthView from "@/components/MonthView"
import WeekView from "@/components/WeekView"
import EventModal from "@/components/EventModal"
import EditModal from "@/components/EditModal"
import useCalendarEvents from "@/hooks/useCalendarEvents"

export type CalendarEvent = {
  id: string
  title: string
  start_date: string
  start_time: string
  duration_hours: number
}

export default function CalendarPage() {
  const { events, setEvents, addEvent, deleteEvent } = useCalendarEvents()

  const [view, setView] = useState<"week" | "month">("month")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null)

  // FIXED: now matches EditModal expected signature
  const updateEvent = async (updated: CalendarEvent) => {
    const res = await fetch(`/api/events/${updated.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })

    if (res.ok) {
      setEvents((prev) =>
        prev.map((ev) => (ev.id === updated.id ? updated : ev))
      )
      setEditEvent(null)
    }
  }

  return (
    <div className="p-6">
      <CalendarHeader
        view={view}
        setView={setView}
        onAdd={() => setShowAddModal(true)}
      />

      {view === "month" ? (
        <MonthView events={events} onSelectEvent={setEditEvent} />
      ) : (
        <WeekView events={events} onSelectEvent={setEditEvent} />
      )}

      {showAddModal && (
        <EventModal
          onClose={() => setShowAddModal(false)}
          onSave={addEvent}
        />
      )}

      {editEvent && (
        <EditModal
          event={editEvent}
          onClose={() => setEditEvent(null)}
          onSave={updateEvent}
          onDelete={deleteEvent}
        />
      )}
    </div>
  )
}
