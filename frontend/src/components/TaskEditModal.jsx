import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosClient from "../api/axiosClient";

export default function TaskEditModal({ task, onClose, onUpdated }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [completed, setCompleted] = useState(task.completed);
  const [dueDate, setDueDate] = useState(task.due_date || "");
  

  // Handle submit (update task)
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosClient.put(`/tasks/${task.id}`, {
        title,
        description,
        priority,
        completed: task.completed,
        dueDate,
      });

      toast.success("Task updated!");
      onUpdated(); // refresh tasks
      onClose();   // close modal
    } catch (err) {
      toast.error("Error updating task");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Edit Task</h2>

        <form onSubmit={handleUpdate} className="space-y-4">
        {/* Title*/}
          <input
            className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Description */}  
          <textarea
            className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded"
            placeholder="Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Due DATE */}
        <input
            type="date"
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 dark:text-white rounded"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
        />


          {/* Priority Dropdown */}
          <select
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 dark:text-white rounded"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          {/* Completed Toggle */}
          <label className="flex items-center space-x-2 dark:text-white">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
            />
            <span>Mark as Completed</span>
          </label>

          {/* Buttons*/}  
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
