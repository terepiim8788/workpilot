import { CalendarEvent } from "@/app/calendar/page"

type WeekViewProps = {
  events: CalendarEvent[]
  onSelectEvent: (event: CalendarEvent) => void
}

export default function WeekView({ events, onSelectEvent }: WeekViewProps) {
  return (
    <div className="flex flex-col gap-2">
      {events.map((ev) => (
        <div
          key={ev.id}
          className="p-3 bg-green-100 rounded cursor-pointer"
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
