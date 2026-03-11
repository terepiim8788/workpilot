export default function CalendarHeader({ view, setView, onAdd }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Calendar</h1>

      <div className="flex gap-3">
        <button
          onClick={() => setView('week')}
          className={`px-4 py-2 rounded-lg ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
        >
          Week
        </button>

        <button
          onClick={() => setView('month')}
          className={`px-4 py-2 rounded-lg ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
        >
          Month
        </button>

        <button
          onClick={onAdd}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Event
        </button>
      </div>
    </div>
  )
}
