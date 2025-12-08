import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

import Navbar from "../components/Navbar";
import TaskItem from "../components/TaskItem";
import EditModal from "../components/EditModal";

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

  // Searchbar
  const [searchQuery, setSearchQuery] = useState("");


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
  const matchesFilter =
    (filter === "completed" && task.completed) ||
    (filter === "pending" && !task.completed) ||
    filter === "all";

  const matchesSearch = task.title
    .toLowerCase()
    .includes(searchQuery.toLowerCase());

  return matchesFilter && matchesSearch;
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
    <div className="min-h-screen p-6 max-w-3xl mx-auto bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">


      <Navbar />

      {/* SEARCH BAR */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>


      {/* FILTER + SORT BAR */}
<div className="flex items-center space-x-3 mb-6">

  {/* FILTER BUTTON — ALL */}
  <button
    className={`
      px-3 py-1 rounded transition-colors
      ${filter === "all"
        ? "bg-blue-600 text-white"
        : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200"}
    `}
    onClick={() => setFilter("all")}
  >
    All
  </button>

  {/* FILTER BUTTON — COMPLETED */}
  <button
    className={`
      px-3 py-1 rounded transition-colors
      ${filter === "completed"
        ? "bg-blue-600 text-white"
        : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200"}
    `}
    onClick={() => setFilter("completed")}
  >
    Completed
  </button>

  {/* FILTER BUTTON — PENDING */}
  <button
    className={`
      px-3 py-1 rounded transition-colors
      ${filter === "pending"
        ? "bg-blue-600 text-white"
        : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200"}
    `}
    onClick={() => setFilter("pending")}
  >
    Pending
  </button>

  {/* SORT DROPDOWN */}
  <select
    value={sortOption}
    onChange={(e) => setSortOption(e.target.value)}
    className="border p-2 rounded ml-auto bg-white dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 transition-colors"
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
        className="mb-8 bg-white dark:bg-gray-800 dark:border-gray-700 p-4 rounded shadow border transition-colors"
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

      {/* Edit Modal */}
      <EditModal
        editingTask={editingTask}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editDesc={editDesc}
        setEditDesc={setEditDesc}
        onSave={async () => {
          await axiosClient.put(`/tasks/${editingTask.id}`, {
            title: editTitle,
            description: editDesc,
            completed: editingTask.completed,
          });
          setEditingTask(null);
          fetchTasks();
        }}
        onCancel={() => setEditingTask(null)}
      />

      {/* Task List */}
      {sortedTasks.length === 0 ? (
        <p>No tasks match your filters.</p>
      ) : (
        <ul className="space-y-3">
          {sortedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={async () => {
                await axiosClient.patch(`/tasks/${task.id}/toggle`);
                fetchTasks();
              }}
              onEdit={() => startEditing(task)}
              onDelete={async () => {
                await axiosClient.delete(`/tasks/${task.id}`);
                fetchTasks();
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}


