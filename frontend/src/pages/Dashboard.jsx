import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

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

  // Toggle Task
  const handleToggle = async (task) => {
    try {
      await axiosClient.patch(`/tasks/${task.id}/toggle`);

      toast.success(task.completed ? "Marked as pending" : "Marked as completed");

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

  if (loading) return <p className="p-6">Loading tasks...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">Your Tasks</h1>

      {/* Create Task Form */}
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

      {/* Filtering + Sorting */}
      <div className="flex gap-3 mb-4">
        <button
          className={`px-3 py-1 rounded ${
            filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"
          }`}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          className={`px-3 py-1 rounded ${
            filter === "completed" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"
          }`}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>

        <button
          className={`px-3 py-1 rounded ${
            filter === "pending" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"
          }`}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
      </div>

      {/* Search + Sort */}
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

      {/* Task List */}
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
                <p className="text-gray-600 dark:text-gray-300">{task.description}</p>

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
    </div>
  );
}



