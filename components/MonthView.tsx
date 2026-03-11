import { CalendarEvent } from "@/app/calendar/page"

type MonthViewProps = {
  events: CalendarEvent[]
  onSelectEvent: (event: CalendarEvent) => void
}

export default function MonthView({ events, onSelectEvent }: MonthViewProps) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {events.map((ev) => (
        <div
          key={ev.id}
          className="p-2 bg-blue-100 rounded cursor-pointer"
          onClick={() => onSelectEvent(ev)}
        >
          <div className="font-semibold">{ev.title}</div>
          <div className="text-sm">
            {ev.start_date} {ev.start_time}
          </div>
        </div>
      ))}
    </div>
  )
}
