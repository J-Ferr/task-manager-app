const subtaskModel = require("../models/subtaskModel");
const taskModel = require("../models/taskModel");

// CREATE
const createSubtask = async (req, res) => {
  try {
    const { title } = req.body;

    const subtask = await subtaskModel.createSubtask(
      req.params.taskId,
      title,
      req.user.id
    );

        // NEW SUBTASK → TASK CANNOT BE COMPLETE
    await taskModel.setTaskCompleted(req.params.taskId, false);

    res.status(201).json(subtask);
  } catch (err) {
    console.error("CREATE SUBTASK ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE (toggle or edit)
const updateSubtask = async (req, res) => {
  try {
    const { completed, title } = req.body;

    const updated = await subtaskModel.updateSubtask(
      req.params.id,
      completed,
      title
    );

    if (!updated) {
      return res.status(404).json({ error: "Subtask not found" });
    }

    // AUTO-COMPLETE PARENT TASK
    const allDone = await subtaskModel.areAllSubtasksCompleted(updated.task_id);
    await taskModel.setTaskCompleted(updated.task_id, allDone);

    res.json(updated);
  } catch (err) {
    console.error("UPDATE SUBTASK ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE
const deleteSubtask = async (req, res) => {
  try {
    const deleted = await subtaskModel.deleteSubtask(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Subtask not found" });
    }

        // RECHECK PARENT AFTER DELETE
    const allDone = await subtaskModel.areAllSubtasksCompleted(deleted.task_id);
    await taskModel.setTaskCompleted(deleted.task_id, allDone);

    res.json({ message: "Subtask deleted" });
  } catch (err) {
    console.error("DELETE SUBTASK ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createSubtask,
  updateSubtask,
  deleteSubtask
};
