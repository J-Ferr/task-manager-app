const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  createSubtask,
  updateSubtask,
  deleteSubtask
} = require("../controllers/subtaskController");

router.use(auth);

router.post("/tasks/:taskId/subtasks", createSubtask);
router.patch("/:id", updateSubtask);
router.delete("/:id", deleteSubtask);

module.exports = router;
