export default function EditModal({ event, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(event.title)
  const [date, setDate] = useState(event.start_date)
  const [time, setTime] = useState(event.start_time)
  const [duration, setDuration] = useState(event.duration_hours)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-80 shadow-xl">

        <h2 className="text-lg font-bold mb-4">Edit Event</h2>

        <input className="w-full border p-2 rounded mb-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <input type="date" className="w-full border p-2 rounded mb-2"
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        <input type="time" className="w-full border p-2 rounded mb-2"
          value={time}
          onChange={e => setTime(e.target.value)}
        />

        <input type="number" className="w-full border p-2 rounded mb-4"
          value={duration}
          onChange={e => setDuration(parseInt(e.target.value))}
          min={1}
        />

        <div className="flex justify-between">
          <button
            onClick={() => onDelete(event.id)}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Delete
          </button>

          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
              Cancel
            </button>

            <button
              onClick={() => onSave(event.id, { title, date, time, duration })}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
