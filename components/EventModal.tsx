export default function EventModal({ onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(1)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-80 shadow-xl">

        <h2 className="text-lg font-bold mb-4">Add Event</h2>

        <input className="w-full border p-2 rounded mb-2"
          placeholder="Title"
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

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>

          <button
            onClick={() => onSave({ title, date, time, duration })}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  )
}
