const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompleted
} = require("../controllers/taskController");

// All task routes require auth
router.use(auth);

router.get("/", getTasks);
router.get("/:id", getTask);
router.post("/", createTask);
router.put("/:id", updateTask);
router.patch("/:id/toggle", toggleTaskCompleted);
router.delete("/:id", deleteTask);

module.exports = router;
