import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

export default function SubtaskList({ taskId }) {
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");

  const fetchSubtasks = async () => {
    try {
      const res = await axiosClient.get(`/tasks/${taskId}/subtasks`);
      setSubtasks(res.data);
    } catch (err) {
      console.error("Error loading subtasks:", err);
      toast.error("Unable to load subtasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubtasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Subtask title is required");
      return;
    }

    try {
      const res = await axiosClient.post(`/tasks/${taskId}/subtasks`, {
        title: newTitle.trim(),
      });
      setSubtasks((prev) => [...prev, res.data]);
      setNewTitle("");
      toast.success("Subtask added");
    } catch (err) {
      console.error("Error creating subtask:", err);
      toast.error("Unable to create subtask");
    }
  };

  const handleToggle = async (subtask) => {
    try {
      const res = await axiosClient.patch(`/tasks/subtasks/${subtask.id}/toggle`);
      setSubtasks((prev) =>
        prev.map((s) => (s.id === subtask.id ? res.data : s))
      );
    } catch (err) {
      console.error("Error toggling subtask:", err);
      toast.error("Unable to update subtask");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/tasks/subtasks/${id}`);
      setSubtasks((prev) => prev.filter((s) => s.id !== id));
      toast.success("Subtask deleted");
    } catch (err) {
      console.error("Error deleting subtask:", err);
      toast.error("Unable to delete subtask");
    }
  };

  if (loading) {
    return <p className="text-xs text-gray-400 mt-2">Loading subtasks...</p>;
  }

  return (
    <div className="mt-3 border-t border-gray-700 pt-3">
      <h4 className="text-sm font-semibold mb-2 dark:text-gray-100">
        Subtasks
      </h4>

      {/* List */}
      {subtasks.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          No subtasks yet.
        </p>
      ) : (
        <ul className="space-y-1 mb-3">
          {subtasks.map((sub) => (
            <li
              key={sub.id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sub.completed}
                  onChange={() => handleToggle(sub)}
                  className="h-4 w-4"
                />
                <span
                  className={`${
                    sub.completed
                      ? "line-through text-gray-400"
                      : "text-gray-800 dark:text-gray-100"
                  }`}
                >
                  {sub.title}
                </span>
              </div>

              <button
                onClick={() => handleDelete(sub.id)}
                className="text-xs text-red-500 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add subtask */}
      <form onSubmit={handleAddSubtask} className="flex gap-2">
        <input
          type="text"
          className="flex-1 px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 dark:text-white"
          placeholder="Add a subtask..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button
          type="submit"
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
        >
          Add
        </button>
      </form>
    </div>
  );
}
