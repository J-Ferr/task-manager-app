import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";
import TaskEditModal from "../components/TaskEditModal";
import SubtaskList from "../components/SubtaskList";
import confetti from "canvas-confetti";
import dayjs from "dayjs";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prevTasks, setPrevTasks] = useState([]);

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
  // CONFETTI ON AUTO-COMPLETE
  // ============================
  useEffect(() => {
    if (prevTasks.length === 0) {
      setPrevTasks(tasks);
      return;
    }

    tasks.forEach((task) => {
      const prev = prevTasks.find((t) => t.id === task.id);

      if (prev && !prev.completed && task.completed) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    });

    setPrevTasks(tasks);
  }, [tasks]);

  // ============================
  // DASHBOARD STATS
  // ============================
  const today = dayjs();

  const completedToday = tasks.filter((t) => t.completed);

  const dueToday = tasks.filter(
    (t) =>
      t.due_date &&
      !t.completed &&
      dayjs(t.due_date).isSame(today, "day")
  );

  const overdueTasks = tasks.filter(
    (t) =>
      t.due_date &&
      !t.completed &&
      dayjs(t.due_date).isBefore(today, "day")
  );

  const totalTasks = tasks.length;

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
            📅 Due: {dayjs(task.due_date).format("MMM D, YYYY")}
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
            className="
            px-3 py-1 rounded text-white
           bg-green-600 hover:bg-green-700
            active:scale-95
            focus:outline-none focus:ring-2 focus:ring-green-400
            transition
            "
          >
            ✏️ Edit
          </button>

          <button
            onClick={() => handleToggle(task)}
            className="
            px-3 py-1 rounded text-white
           bg-yellow-500 hover:bg-yellow-600
            active:scale-95
            focus:outline-none focus:ring-2 focus:ring-yellow-400
            transition
            "
          >
            🔁 Toggle
          </button>

          <button
            onClick={() => handleDelete(task.id)}
            className="
            px-3 py-1 rounded text-white
           bg-red-600 hover:bg-red-700
            active:scale-95
            focus:outline-none focus:ring-2 focus:ring-red-400
            transition
            "
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
      <h1 className="text-3xl font-bold mb-2">Task Dashboard</h1>

      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded bg-green-100 dark:bg-green-900/30 text-center">
          <p className="text-sm">Completed Today</p>
          <p className="text-2xl font-bold">{completedToday.length}</p>
        </div>

        <div className="p-4 rounded bg-blue-100 dark:bg-blue-900/30 text-center">
          <p className="text-sm">Due Today</p>
          <p className="text-2xl font-bold">{dueToday.length}</p>
        </div>

        <div className="p-4 rounded bg-red-100 dark:bg-red-900/30 text-center">
          <p className="text-sm">Overdue</p>
          <p className="text-2xl font-bold">{overdueTasks.length}</p>
        </div>

        <div className="p-4 rounded bg-gray-200 dark:bg-gray-800 text-center">
          <p className="text-sm">Total Tasks</p>
          <p className="text-2xl font-bold">{totalTasks}</p>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => setFilter("all")} className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700">
          All
        </button>
        <button onClick={() => setFilter("pending")} className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700">
          ⏳ Pending
        </button>
        <button onClick={() => setFilter("completed")} className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700">
          ✅ Completed
        </button>
      </div>

      {/* CREATE TASK */}
      <form onSubmit={handleCreateTask} className="space-y-3 mb-8">
        <input className="w-full p-3 rounded bg-gray-200 dark:bg-gray-800" placeholder="✍️ Task title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        <textarea className="w-full p-3 rounded bg-gray-200 dark:bg-gray-800" placeholder="Task description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
        <input type="date" className="w-full p-3 rounded bg-gray-200 dark:bg-gray-800" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
        <select className="w-full p-3 rounded bg-gray-200 dark:bg-gray-800" value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          ➕ Add Task
        </button>
      </form>

      {filter === "all" && <ul className="space-y-4">{tasks.map(renderTask)}</ul>}
      {filter === "pending" && <ul className="space-y-4">{pendingTasks.map(renderTask)}</ul>}
      {filter === "completed" && <ul className="space-y-4">{completedTasks.map(renderTask)}</ul>}

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
