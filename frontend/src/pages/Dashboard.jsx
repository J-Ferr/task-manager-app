import { useEffect, useState, useContext } from "react";
import axiosClient from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create new task
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Edit task
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Filtering + sorting
  const [filter, setFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  // Auth
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

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

  // FILTERING
  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true; // all
  });

  // SORTING
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortOption === "newest") return b.id - a.id;
    if (sortOption === "oldest") return a.id - b.id;
    if (sortOption === "az") return a.title.localeCompare(b.title);
    if (sortOption === "completed") return b.completed - a.completed;
    return 0;
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Tasks</h1>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* FILTER + SORT BAR */}
      <div className="flex items-center space-x-3 mb-6">
        {/* Filter Buttons */}
        <button
          className={`px-3 py-1 rounded ${
            filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          className={`px-3 py-1 rounded ${
            filter === "completed" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>

        <button
          className={`px-3 py-1 rounded ${
            filter === "pending" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>

        {/* Sort Dropdown */}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border p-2 rounded ml-auto"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="az">A → Z</option>
          <option value="completed">Completed First</option>
        </select>
      </div>

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

      {/* Task List */}
      {sortedTasks.length === 0 ? (
        <p>No tasks match your filters.</p>
      ) : (
        <ul className="space-y-3">
          {sortedTasks.map((task) => (
            <li
              key={task.id}
              className="border p-3 rounded shadow-sm bg-white flex justify-between items-center"
            >
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


