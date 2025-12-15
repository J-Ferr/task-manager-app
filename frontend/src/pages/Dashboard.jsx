import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";
import TaskEditModal from "../components/TaskEditModal";
import SubtaskList from "../components/SubtaskList";
import confetti from "canvas-confetti";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDueDate, setNewDueDate] = useState("");

  const [filter, setFilter] = useState("all"); // all | pending | completed
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const [editingTask, setEditingTask] = useState(null);

  // ============================
  // FETCH TASKS
  // ============================
  const fetchTasks = async () => {
    try {
      const completed =
        filter === "all" ? null : filter === "completed";

      const { data } = await axiosClient.get("/tasks", {
        params: { search, sort, completed },
      });

      setTasks(data);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter, search, sort]);

  // ============================
  // CREATE TASK
  // ============================
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
        due_date: newDueDate || null,
      });

      toast.success("Task created ✨");

      setNewTitle("");
      setNewDesc("");
      setNewPriority("medium");
      setNewDueDate("");

      fetchTasks();
    } catch {
      toast.error("Error creating task");
    }
  };

  // ============================
  // TOGGLE TASK
  // ============================
  const handleToggle = async (task) => {
    try {
      await axiosClient.patch(`/tasks/${task.id}/toggle`);

      if (!task.completed) {
        confetti({ particleCount: 90, spread: 70 });
      }

      fetchTasks();
    } catch {
      toast.error("Unable to update task");
    }
  };

  // ============================
  // DELETE TASK
  // ============================
  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/tasks/${id}`);
      toast.success("Task deleted 🗑️");
      fetchTasks();
    } catch {
      toast.error("Unable to delete task");
    }
  };

  // ============================
  // RENDER TASK
  // ============================
  const renderTask = (task) => {
    const totalSubtasks = task.subtasks.length;
    const completedSubtasks = task.subtasks.filter(s => s.completed).length;

    return (
      <li
        key={task.id}
        className="border dark:border-gray-700 p-4 rounded bg-white dark:bg-gray-800 shadow"
      >
        <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
          {task.title}
        </h2>

        <p className="text-gray-600 dark:text-gray-300">
          {task.description}
        </p>

        {task.due_date && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            📅 Due: {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}

        <p
          className={`mt-2 text-sm font-medium ${
            task.completed
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {task.completed ? "✅ Completed" : "⏳ Pending"}
        </p>

        {totalSubtasks > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
              🧩 {completedSubtasks}/{totalSubtasks} subtasks completed
            </p>
            <div className="w-full bg-gray-300 dark:bg-gray-700 rounded h-2">
              <div
                className="h-2 bg-blue-600 transition-all"
                style={{
                  width: `${(completedSubtasks / totalSubtasks) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        <SubtaskList
          taskId={task.id}
          subtasks={task.subtasks}
          onSubtaskChange={fetchTasks}
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setEditingTask(task)}
            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            ✏️ Edit
          </button>

          <button
            onClick={() => handleToggle(task)}
            className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
          >
            🔁 Toggle
          </button>

          <button
            onClick={() => handleDelete(task.id)}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            🗑️ Delete
          </button>
        </div>
      </li>
    );
  };

  if (loading) {
    return (
      <p className="p-6 text-gray-700 dark:text-gray-300">
        Loading tasks...
      </p>
    );
  }

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="pb-20 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-4"> Task Dashboard</h1>

      {/* FILTER BUTTONS */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
           All
        </button>

        <button
          onClick={() => setFilter("pending")}
          className={`px-3 py-1 rounded ${
            filter === "pending"
              ? "bg-blue-600 text-white"
              : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          ⏳ Pending
        </button>

        <button
          onClick={() => setFilter("completed")}
          className={`px-3 py-1 rounded ${
            filter === "completed"
              ? "bg-blue-600 text-white"
              : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          ✅ Completed
        </button>
      </div>

      {/* CREATE TASK */}
      <form onSubmit={handleCreateTask} className="space-y-3 mb-8">
        <input
          className="w-full p-3 rounded bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="✍️ Task title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />

        <textarea
          className="w-full p-3 rounded bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder=" Task description"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
        />

        <input
          type="date"
          className="w-full p-3 rounded bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
        />

        <select
          className="w-full p-3 rounded bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
        >
          <option value="low">🟢 Low Priority</option>
          <option value="medium">🟡 Medium Priority</option>
          <option value="high">🔴 High Priority</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          ➕ Add Task
        </button>
      </form>

      {/* TASK LISTS */}
      {filter === "all" && (
        <>
          <h2 className="text-xl font-bold mb-3"> All Tasks</h2>
          <ul className="space-y-4">{tasks.map(renderTask)}</ul>
        </>
      )}

      {filter === "pending" && (
        <>
          <h2 className="text-xl font-bold mb-3">⏳ Pending Tasks</h2>
          <ul className="space-y-4">{pendingTasks.map(renderTask)}</ul>
        </>
      )}

      {filter === "completed" && (
        <>
          <h2 className="text-xl font-bold mb-3">✅ Completed Tasks</h2>
          <ul className="space-y-4">{completedTasks.map(renderTask)}</ul>
        </>
      )}

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdated={fetchTasks}
        />
      )}
    </div>
  );
}


