const subtaskModel = require("../models/subtaskModel");

// GET /tasks/:taskId/subtasks
const getSubtasksForTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const subtasks = await subtaskModel.getSubtasksForTask(taskId, req.user.id);
    return res.json(subtasks);
  } catch (err) {
    console.error("GET SUBTASKS ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

// POST /tasks/:taskId/subtasks
const createSubtask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Subtask title is required" });
    }

    const newSubtask = await subtaskModel.createSubtask(
      taskId,
      title.trim(),
      req.user.id
    );

    if (!newSubtask) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(201).json(newSubtask);
  } catch (err) {
    console.error("CREATE SUBTASK ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

// PATCH /subtasks/:id/toggle
const toggleSubtaskCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await subtaskModel.toggleSubtaskCompleted(id, req.user.id);

    if (!updated) {
      return res.status(404).json({ error: "Subtask not found" });
    }

    return res.json(updated);
  } catch (err) {
    console.error("TOGGLE SUBTASK ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

// DELETE /subtasks/:id
const deleteSubtask = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await subtaskModel.deleteSubtask(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({ error: "Subtask not found" });
    }

    return res.json({ message: "Subtask deleted" });
  } catch (err) {
    console.error("DELETE SUBTASK ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getSubtasksForTask,
  createSubtask,
  toggleSubtaskCompleted,
  deleteSubtask,
};
