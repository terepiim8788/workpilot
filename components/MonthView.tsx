export default function MonthView({ events, onEdit }) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const days = []
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="grid grid-cols-7 gap-2 text-center font-semibold mb-2">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dateString = day.toISOString().slice(0, 10)

          return (
            <div
              key={dateString}
              className="border p-2 rounded min-h-[80px] bg-gray-50"
            >
              <div className="font-bold mb-1">{day.getDate()}</div>

              {events
                .filter(e => e.start_date === dateString)
                .map(event => (
                  <div
                    key={event.id}
                    className="bg-blue-600 text-white text-xs p-1 rounded mb-1 cursor-pointer"
                    onClick={() => onEdit(event)}
                  >
                    {event.title}
                  </div>
                ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
