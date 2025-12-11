const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const requireAuth = require('../middleware/authMiddleware');
const subtaskController = require("../controllers/subtaskController");


// Protect all routes below this line
router.use(requireAuth);


// Routes
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTask);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.patch('/:id/toggle', taskController.toggleTaskCompleted);

// Subtasks routes

// Get all subtasks for a task
router.get("/:taskId/subtasks", subtaskController.getSubtasksForTask);

// Create a new subtask for a task
router.post("/:taskId/subtasks", subtaskController.createSubtask);

// Toggle a subtask
router.patch("/subtasks/:id/toggle", subtaskController.toggleSubtaskCompleted);

// Delete a subtask
router.delete("/subtasks/:id", subtaskController.deleteSubtask);


module.exports = router;