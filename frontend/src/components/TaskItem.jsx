export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  return (
    <li className="border p-3 rounded shadow-sm bg-white flex justify-between items-center">
      <div>
        <h2 className="font-semibold text-lg">{task.title}</h2>
        <p className="text-gray-600">{task.description}</p>
        <p className="text-sm mt-1">
          Status:{" "}
          <span className={task.completed ? "text-green-600" : "text-red-600"}>
            {task.completed ? "Completed" : "Pending"}
          </span>
        </p>
      </div>

      <div className="flex space-x-2">
        {/* Toggle Completed */}
        <button
          onClick={onToggle}
          className={`px-3 py-1 rounded ${
            task.completed ? "bg-yellow-500" : "bg-green-500"
          } text-white`}
        >
          {task.completed ? "Unmark" : "Complete"}
        </button>

        {/* Edit */}
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-indigo-500 text-white rounded"
        >
          Edit
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
