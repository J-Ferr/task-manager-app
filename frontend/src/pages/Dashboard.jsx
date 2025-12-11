import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";
import TaskEditModal from "../components/TaskEditModal";
import confetti from "canvas-confetti";
import SubtaskList from "../components/SubtaskList";


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
        filter === "all" ? null : filter === "completed" ? true : false;

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
        due_date: newDueDate || null,
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

  // Toggle Task Completion
  const handleToggle = async (task) => {
    try {
      await axiosClient.patch(`/tasks/${task.id}/toggle`);

      const isNowCompleted = !task.completed;
      toast.success(isNowCompleted ? "Task completed!" : "Marked as pending");

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

  // Due Status
  const getDueStatus = (task) => {
    if (!task.due_date) return "none";

    const today = new Date();
    const due = new Date(task.due_date);
    const diff = (due - today) / (1000 * 60 * 60 * 24);

    if (task.completed) return "completed";
    if (diff < 0) return "overdue";
    if (diff <= 1) return "due-soon";
    if (diff <= 7) return "due-week";
    return "upcoming";
  };

  // Edit Modal
  const openEditModal = (task) => setEditingTask(task);
  const closeEditModal = () => setEditingTask(null);

  // Render a single task card
  const renderTask = (task) => (
    <li
      key={task.id}
      className="border dark:border-gray-700 p-4 rounded bg-white dark:bg-gray-800 shadow flex justify-between"
    >
      <div>
        <h2 className="font-semibold text-lg dark:text-white">{task.title}</h2>
        <p className="text-gray-600 dark:text-gray-300">{task.description}</p>

        {/* Priority Badge */}
        <span
          className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${
            task.priority === "high"
              ? "bg-red-600 text-white"
              : task.priority === "medium"
              ? "bg-yellow-500 text-black"
              : "bg-green-600 text-white"
          }`}
        >
          {task.priority.toUpperCase()}
        </span>

        {/* Subtask Progress */}
        {task.total_subtasks > 0 && (
          <div className="mt-3">
          <p className="text-sm dark:text-gray-300 mb-1">
            {task.completed_subtasks}/{task.total_subtasks} subtasks completed
          </p>

          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded h-2 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{
                width: `${(task.completed_subtasks / task.total_subtasks) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}


        {/* Due Date */}
        {task.due_date && (
          <p
            className={`mt-2 text-sm font-semibold ${
              getDueStatus(task) === "overdue"
                ? "text-red-500"
                : getDueStatus(task) === "due-soon"
                ? "text-orange-400"
                : getDueStatus(task) === "due-week"
                ? "text-yellow-500"
                : "text-gray-500 dark:text-gray-300"
            }`}
          >
            Due: {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}

        {/* Status */}
        <span
          className={`text-sm block mt-2 ${
            task.completed ? "text-green-500" : "text-red-500"
          }`}
        >
          {task.completed ? "Completed" : "Pending"}
        </span>

        {/* Subtasks */}
        <SubtaskList taskId={task.id} />

      </div>

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
  );

  // GROUPS — Option A (only show if tasks exist)
  const highPriority = tasks.filter((t) => t.priority === "high" && !t.completed);
  const overdue = tasks.filter((t) => getDueStatus(t) === "overdue");
  const dueSoon = tasks.filter((t) => getDueStatus(t) === "due-soon");
  const dueWeek = tasks.filter((t) => getDueStatus(t) === "due-week");
  const completedTasks = tasks.filter((t) => t.completed);
  const otherTasks = tasks.filter(
    (t) =>
      !t.completed &&
      t.priority !== "high" &&
      getDueStatus(t) !== "overdue" &&
      getDueStatus(t) !== "due-soon" &&
      getDueStatus(t) !== "due-week"
  );

  if (loading)
    return <p className="p-6 dark:text-gray-300">Loading tasks...</p>;

  return (
    <div className="pb-20">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Your Tasks</h1>

      {/* CREATE TASK FORM */}
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

      {/* SEARCH / FILTER / SORT */}
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

          <option value="priority-high">High Priority First</option>
          <option value="priority-low">Low Priority First</option>

          <option value="due-soon">Due Soon</option>
          <option value="due-late">Due Later</option>
        </select>
      </div>

      {/* GROUPED TASK SECTIONS */}
      <div className="space-y-8">
        {highPriority.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-red-500 mb-3">🔥 High Priority</h2>
            <ul className="space-y-3">{highPriority.map(renderTask)}</ul>
          </section>
        )}

        {overdue.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-red-400 mb-3">⚠️ Overdue</h2>
            <ul className="space-y-3">{overdue.map(renderTask)}</ul>
          </section>
        )}

        {dueSoon.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-3">⏳ Due Soon</h2>
            <ul className="space-y-3">{dueSoon.map(renderTask)}</ul>
          </section>
        )}

        {dueWeek.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-yellow-500 mb-3">📅 Due This Week</h2>
            <ul className="space-y-3">{dueWeek.map(renderTask)}</ul>
          </section>
        )}

        {otherTasks.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-400 mb-3">📌 Other Tasks</h2>
            <ul className="space-y-3">{otherTasks.map(renderTask)}</ul>
          </section>
        )}

        {completedTasks.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-green-500 mb-3">🟢 Completed</h2>
            <ul className="space-y-3">{completedTasks.map(renderTask)}</ul>
          </section>
        )}
      </div>

      {/* EDIT MODAL */}
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

