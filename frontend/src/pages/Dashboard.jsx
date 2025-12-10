import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";
import TaskEditModal from "../components/TaskEditModal";
import confetti from "canvas-confetti";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDueDate, setNewDueDate] = useState("");

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const [editingTask, setEditingTask] = useState(null);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const completed =
        filter === "all"
          ? null
          : filter === "completed"
          ? true
          : false;

      const res = await axiosClient.get("/tasks", {
        params: { search, sort, completed },
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
        priority: newPriority,
        due_date: newDueDate,
      });

      toast.success("Task created!");

      setNewTitle("");
      setNewDesc("");
      setNewPriority("medium");
      setNewDueDate("");

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

    const isNowCompleted = !task.completed;

    toast.success(isNowCompleted ? "Task completed!" : "Marked as pending");

    // Fire confetti ONLY when marking as completed
    if (isNowCompleted) {
  let end = Date.now() + 600;

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });

    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });

    if (Date.now() < end) requestAnimationFrame(frame);
  };

  frame();
}


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

  // Edit Modal
  const openEditModal = (task) => setEditingTask(task);
  const closeEditModal = () => setEditingTask(null);

  if (loading) return <p className="p-6 dark:text-gray-300">Loading tasks...</p>;

  return (
    <div className="pb-20">

      <h1 className="text-3xl font-bold mb-6 dark:text-white">Your Tasks</h1>

      {/* Create Task Form */}
      <form onSubmit={handleCreateTask} className="mb-6 space-y-3">

        <input
          className="w-full p-3 bg-gray-200 dark:bg-gray-800 dark:text-white rounded"
          placeholder="Task title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />

        <textarea
          className="w-full p-3 bg-gray-200 dark:bg-gray-800 dark:text-white rounded"
          placeholder="Task description (optional)"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
        />

        <input
          type="date"
          className="w-full p-3 bg-gray-200 dark:bg-gray-800 dark:text-white rounded"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
        />

        {/* PRIORITY DROPDOWN */}
        <select
          className="w-full p-3 bg-gray-200 dark:bg-gray-800 dark:text-white rounded"
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Add Task
        </button>
      </form>

      {/* Filtering */}
      <div className="flex gap-3 mb-4">
        <button
          className={`px-3 py-1 rounded ${
            filter === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-300 dark:bg-gray-700 dark:text-white"
          }`}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          className={`px-3 py-1 rounded ${
            filter === "completed"
              ? "bg-blue-500 text-white"
              : "bg-gray-300 dark:bg-gray-700 dark:text-white"
          }`}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>

        <button
          className={`px-3 py-1 rounded ${
            filter === "pending"
              ? "bg-blue-500 text-white"
              : "bg-gray-300 dark:bg-gray-700 dark:text-white"
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
          className="flex-1 p-3 bg-gray-200 dark:bg-gray-800 dark:text-white rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="p-3 bg-gray-200 dark:bg-gray-800 dark:text-white rounded"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300 text-center">
          No tasks found.
        </p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="border dark:border-gray-700 p-4 rounded bg-white dark:bg-gray-800 shadow flex justify-between"
            >

              <div>
                <h2 className="font-semibold text-lg dark:text-white">
                  {task.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">{task.description}</p>

                {/* PRIORITY BADGE */}
                <span
                  className={`inline-block mt-2 px-2 py-1 text-sm rounded ${
                    task.priority === "high"
                      ? "bg-red-600 text-white"
                      : task.priority === "medium"
                      ? "bg-yellow-500 text-black"
                      : "bg-green-600 text-white"
                  }`}
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>

                {/* STATUS */}
                <span
                  className={`text-sm block mt-2 ${
                    task.completed ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {task.completed ? "Completed" : "Pending"}
                </span>
              </div>
              {/*Due Date*/}
              {task.due_date && (
                <p
                  className={`mt-2 text-sm ${
                    new Date(task.due_date) < new Date() && !task.completed
                     ? "text-red-500 font-semibold"
                     : "dark:text-gray-300 text-gray-600"
                 }`}
                >
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </p>
              )}

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => openEditModal(task)}
                  className="px-2 py-1 bg-green-600 text-white rounded"
                >
                  Edit
                </button>

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

      {/* Edit Modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={closeEditModal}
          onUpdated={fetchTasks}
        />
      )}

    </div>
  );
}


