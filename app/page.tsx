'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date())

  // SESSION
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

  // PROFILE
  useEffect(() => {
    if (!session) return

    const loadProfile = async () => {
      const { data } = await supabase
        .from('users')
        .select('role, company_id')
        .eq('id', session.user.id)
        .single()

      if (data) {
        setProfile({
          role: data.role,
          companyId: data.company_id,
        })
      }
    }

    loadProfile()
  }, [session])

  // LOAD TEAM
  useEffect(() => {
    if (!profile?.companyId) return

    const loadTeam = async () => {
      const { data } = await supabase
        .from('users')
        .select('id, role')
        .eq('company_id', profile.companyId)

      if (data) setEmployees(data)
    }

    loadTeam()
  }, [profile])

  // REALTIME EVENTS
  useEffect(() => {
    if (!profile?.companyId) return

    const loadEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('company_id', profile.companyId)

      if (data) setEvents(data)
    }

    loadEvents()

    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        loadEvents
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile])

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

  const hours = Array.from({ length: 12 }).map((_, i) => 8 + i)

  const statusColor = (status: string) => {
    if (status === 'done') return 'bg-green-200'
    if (status === 'accepted') return 'bg-yellow-200'
    return 'bg-red-200'
  }

  if (!session) return <div className="p-10">Login first...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        WorkPilot Enterprise Calendar
      </h1>

      <div className="flex gap-2 mb-4">
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

      <div className="grid grid-cols-8 border">
        <div></div>
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className="border text-center font-semibold p-2"
          >
            {day.toLocaleDateString(undefined, {
              weekday: 'short',
              day: 'numeric',
            })}
          </div>
        ))}

        {hours.map((hour) => (
          <>
            <div
              key={hour}
              className="border p-2 text-sm text-gray-500"
            >
              {hour}:00
            </div>

            {weekDays.map((day) => {
              const cellEvents = events.filter((event) => {
                if (!event.start_date) return false
                const eventDate = new Date(event.start_date)
                return (
                  eventDate.toDateString() === day.toDateString() &&
                  eventDate.getHours() === hour
                )
              })

              return (
                <div
                  key={day.toISOString() + hour}
                  className="border relative h-20 p-1"
                >
                  {cellEvents.map((event) => {
                    const start = new Date(event.start_date)
                    const end = event.end_date
                      ? new Date(event.end_date)
                      : start

                    const duration =
                      (end.getTime() - start.getTime()) / 3600000

                    return (
                      <div
                        key={event.id}
                        className={`absolute w-full p-1 rounded text-xs shadow ${statusColor(
                          event.status
                        )}`}
                        style={{
                          height: `${duration * 80}px`,
                          top: 0,
                        }}
                      >
                        {event.title}
                        <div>{event.status}</div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}
