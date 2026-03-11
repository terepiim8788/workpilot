import { useState } from 'react'

const HOUR_HEIGHT = 64
const HEADER_HEIGHT = 48

function formatDateLocal(date: Date) {
  return date.toISOString().slice(0, 10)
}

export default function WeekView({ events, onEdit }) {
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date())

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

  const hours = Array.from({ length: 24 }).map((_, i) => i)

  return (
    <div className="bg-white rounded-xl shadow overflow-auto max-h-[75vh]">
      <div className="grid grid-cols-8 min-w-[1200px]">

        {/* HOURS */}
        <div className="border-r bg-gray-50">
          {hours.map(hour => (
            <div
              key={hour}
              className="border-b px-3 text-sm pt-2 text-gray-600"
              style={{ height: HOUR_HEIGHT }}
            >
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* DAYS */}
        {weekDays.map(day => {
          const dateString = formatDateLocal(day)

          return (
            <div key={dateString} className="border-r relative">

              <div
                className="border-b flex items-center justify-center font-semibold bg-gray-50"
                style={{ height: HEADER_HEIGHT }}
              >
                {day.toLocaleDateString(undefined, {
                  weekday: 'short',
                  day: 'numeric',
                })}
              </div>

              <div className="relative">
                {hours.map(hour => (
                  <div
                    key={hour}
                    className="border-b"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}

                {events
                  .filter(e => e.start_date === dateString)
                  .map(event => {
                    const [h, m] = event.start_time.split(':')
                    const top =
                      HEADER_HEIGHT +
                      parseInt(h) * HOUR_HEIGHT +
                      (parseInt(m) / 60) * HOUR_HEIGHT

                    const height =
                      (event.duration_hours || 1) * HOUR_HEIGHT

                    return (
                      <div
                        key={event.id}
                        className="absolute left-1 right-1 bg-blue-600 text-white text-xs rounded-lg p-2 shadow cursor-pointer"
                        style={{ top, height: height - 4 }}
                        onClick={() => onEdit(event)}
                      >
                        {event.title}
                      </div>
                    )
                  })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
