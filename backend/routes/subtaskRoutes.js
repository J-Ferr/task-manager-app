const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  createSubtask,
  updateSubtask,
  deleteSubtask,
} = require("../controllers/subtaskController");

router.use(auth);

// Create subtask under a task
router.post("/tasks/:taskId/subtasks", createSubtask);

// Update / delete subtask directly
router.patch("/subtasks/:id", updateSubtask);
router.delete("/subtasks/:id", deleteSubtask);

module.exports = router;
