'use client'

import { useState } from 'react'
import CalendarHeader from '@/components/CalendarHeader'
import WeekView from '@/components/WeekView'
import MonthView from '@/components/MonthView'
import EventModal from '@/components/EventModal'
import EditModal from '@/components/EditModal'
import useCalendarEvents from '@/hooks/useCalendarEvents'

export default function CalendarPage() {
  const {
    session,
    events,
    addEvent,
    updateEvent,
    deleteEvent
  } = useCalendarEvents()

  const [view, setView] = useState<'week' | 'month'>('week')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editEvent, setEditEvent] = useState<any>(null)

  if (!session) return <div className="p-10">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">

      <CalendarHeader
        view={view}
        setView={setView}
        onAdd={() => setShowAddModal(true)}
      />

      {view === 'week' && (
        <WeekView
          events={events}
          onEdit={setEditEvent}
        />
      )}

      {view === 'month' && (
        <MonthView
          events={events}
          onEdit={setEditEvent}
        />
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
