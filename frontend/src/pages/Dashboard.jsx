import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create new task state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Edit task state
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const res = await axiosClient.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const startEditing = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || "");
  };

  if (loading) return <p className="p-6">Loading tasks...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Tasks</h1>

      {/* Create Task Form */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!newTitle.trim()) return;

          try {
            await axiosClient.post("/tasks", {
              title: newTitle,
              description: newDesc,
            });
            setNewTitle("");
            setNewDesc("");
            fetchTasks();
          } catch (err) {
            console.error("Error creating task:", err);
          }
        }}
        className="mb-8 bg-white p-4 rounded shadow border"
      >
        <h2 className="text-lg font-semibold mb-3">Create a New Task</h2>

        <input
          type="text"
          placeholder="Task title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
          required
        />

        <textarea
          placeholder="Description (optional)"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Add Task
        </button>
      </form>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="mb-8 bg-white p-4 rounded shadow border">
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
              onClick={async () => {
                await axiosClient.put(`/tasks/${editingTask.id}`, {
                  title: editTitle,
                  description: editDesc,
                  completed: editingTask.completed,
                });
                setEditingTask(null);
                fetchTasks();
              }}
              className="bg-green-600 text-white px-4 py-2 rounded w-full"
            >
              Save Changes
            </button>

            <button
              onClick={() => setEditingTask(null)}
              className="bg-gray-400 text-white px-4 py-2 rounded w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <p>No tasks yet. Create one!</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="border p-3 rounded shadow-sm bg-white flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold text-lg">{task.title}</h2>
                <p className="text-gray-600">{task.description}</p>
                <p className="text-sm mt-1">
                  Status:{" "}
                  <span
                    className={
                      task.completed ? "text-green-600" : "text-red-600"
                    }
                  >
                    {task.completed ? "Completed" : "Pending"}
                  </span>
                </p>
              </div>

              <div className="flex space-x-2">
                {/* Toggle Completed */}
                <button
                  onClick={async () => {
                    await axiosClient.patch(`/tasks/${task.id}/toggle`);
                    fetchTasks();
                  }}
                  className={`px-3 py-1 rounded ${
                    task.completed ? "bg-yellow-500" : "bg-green-500"
                  } text-white`}
                >
                  {task.completed ? "Unmark" : "Complete"}
                </button>

                {/* Edit */}
                <button
                  onClick={() => startEditing(task)}
                  className="px-3 py-1 bg-indigo-500 text-white rounded"
                >
                  Edit
                </button>

                {/* Delete */}
                <button
                  onClick={async () => {
                    await axiosClient.delete(`/tasks/${task.id}`);
                    fetchTasks();
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

