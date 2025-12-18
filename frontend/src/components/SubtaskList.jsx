import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";
import { useState } from "react";

export default function SubtaskList({ taskId, subtasks = [], onSubtaskChange }) {
  const [newTitle, setNewTitle] = useState("");

  // ============================
  // ADD SUBTASK
  // ============================
  const handleAddSubtask = async (e) => {
    e.preventDefault();

    if (!newTitle.trim()) {
      toast.error("Subtask title is required");
      return;
    }

    try {
      await axiosClient.post(`/tasks/${taskId}/subtasks`, {
        title: newTitle.trim(),
      });

      setNewTitle("");
      toast.success("Subtask added");

      onSubtaskChange(); // re-fetch tasks
    } catch (err) {
      console.error(err);
      toast.error("Unable to create subtask");
    }
  };

  // ============================
  // TOGGLE SUBTASK
  // ============================
  const handleToggle = async (subtask) => {
    try {
      await axiosClient.patch(`/subtasks/${subtask.id}`, {
        completed: !subtask.completed,
      });

      onSubtaskChange();
    } catch (err) {
      console.error(err);
      toast.error("Unable to update subtask");
    }
  };

  // ============================
  // DELETE SUBTASK
  // ============================
  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/subtasks/${id}`);
      toast.success("Subtask deleted");
      onSubtaskChange();
    } catch (err) {
      console.error(err);
      toast.error("Unable to delete subtask");
    }
  };

  return (
    <div className="mt-3 border-t border-gray-700 pt-3">
      <h4 className="text-sm font-semibold mb-2 dark:text-gray-100">
        Subtasks
      </h4>

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
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleToggle(sub)}
                  className="h-4 w-4"
                />
                <span
                  className={
                    sub.completed
                      ? "line-through text-gray-400"
                      : "text-gray-800 dark:text-gray-100"
                  }
                >
                  {sub.title}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(sub.id);
                }}
                className="text-xs text-red-500 hover:underline"
              >
                Delete
              </button>

            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAddSubtask} className="flex gap-2">
        <input
          type="text"
          className="
            flex-1 px-3 py-2 text-xs rounded
             bg-gray-100 text-gray-900
             dark:bg-gray-200 dark:text-gray-900
             placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500
              "
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

