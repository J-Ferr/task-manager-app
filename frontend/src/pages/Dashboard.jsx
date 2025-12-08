import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Filters / Search / Sort
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  // Editing
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const fetchTasks = async () => {
    try {
      const res = await axiosClient.get("/tasks", {
        params: {
          search,
          sort,
          completed: filter === "all" ? undefined : filter === "completed",
        },
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      toast.error("Unable to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter, search, sort]);

  // Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!newTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      await axiosClient.post("/tasks", {
        title: newTitle,
        description: newDesc,
      });

      toast.success("Task created!");

      setNewTitle("");
      setNewDesc("");
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error("Error creating task");
    }
  };

  // Toggle Completed
  const handleToggle = async (task) => {
    try {
      await axiosClient.patch(`/tasks/${task.id}/toggle`);

      toast.success(
        task.completed ? "Marked as pending" : "Marked as completed"
      );

      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error("Unable to update task status");
    }
  };

  // Delete Task
  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/tasks/${id}`);

      toast.success("Task deleted!");

      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error("Unable to delete task");
    }
  };

  // Update Task (Edit)
  const handleUpdateTask = async (e) => {
    e.preventDefault();

    if (!editTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      await axiosClient.put(`/tasks/${editingTask.id}`, {
        title: editTitle,
        description: editDesc,
      });

      toast.success("Task updated!");
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error("Unable to update task");
    }
  };

  if (loading) return <p className="p-6">Loading tasks...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">Your Tasks</h1>

      {/* CREATE TASK */}
      <form onSubmit={handleCreateTask} className="mb-6 space-y-3">
        <input
          className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded"
          placeholder="Task title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />

        <textarea
          className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded"
          placeholder="Task description (optional)"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
        />

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Add Task
        </button>
      </form>

      {/* FILTERS */}
      <div className="flex gap-3 mb-4">
        <button
          className={`px-3 py-1 rounded ${
            filter === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          className={`px-3 py-1 rounded ${
            filter === "completed"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>

        <button
          className={`px-3 py-1 rounded ${
            filter === "pending"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
      </div>

      {/* SEARCH + SORT */}
      <div className="flex gap-3 mb-6">
        <input
          placeholder="Search tasks..."
          className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="p-3 bg-gray-100 dark:bg-gray-800 rounded"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* TASK LIST */}
      {tasks.length === 0 ? (
        <p className="text-gray-500 text-center">No tasks found.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="border p-4 rounded bg-white dark:bg-gray-800 shadow flex justify-between"
            >
              <div>
                <h2 className="font-semibold text-lg">{task.title}</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {task.description}
                </p>

                <span
                  className={`text-sm block mt-2 ${
                    task.completed ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {task.completed ? "Completed" : "Pending"}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleToggle(task)}
                  className="px-2 py-1 bg-yellow-500 text-white rounded"
                >
                  Toggle
                </button>

                <button
                  onClick={() => {
                    setEditingTask(task);
                    setEditTitle(task.title);
                    setEditDesc(task.description);
                  }}
                  className="px-2 py-1 bg-blue-600 text-white rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* EDIT MODAL */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Edit Task</h2>

            <form onSubmit={handleUpdateTask} className="space-y-3">
              <input
                className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />

              <textarea
                className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
