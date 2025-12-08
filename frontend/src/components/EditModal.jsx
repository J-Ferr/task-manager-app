export default function EditModal({
  editingTask,
  editTitle,
  setEditTitle,
  editDesc,
  setEditDesc,
  onSave,
  onCancel,
}) {
  if (!editingTask) return null;

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 dark:border-gray-700 p-4 rounded shadow border transition-colors">
      <h2 className="text-lg font-semibold mb-3">Edit Task</h2>

      <input
        type="text"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        className="border p-2 w-full mb-3 rounded"
      />

      <textarea
        value={editDesc}
        onChange={(e) => setEditDesc(e.target.value)}
        className="border p-2 w-full mb-3 rounded"
      />

      <div className="flex space-x-2">
        <button
          onClick={onSave}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          Save Changes
        </button>

        <button
          onClick={onCancel}
          className="bg-gray-400 text-white px-4 py-2 rounded w-full"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
