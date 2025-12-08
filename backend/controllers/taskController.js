const taskModel = require('../models/taskModel');
const validateTaskInput = require('../utils/validateTask');

// Get all tasks (with filtering)
const getTasks = async (req, res) => {
    try {
        let { search, sort, completed } = req.query;

        // Convert completed from string → boolean or null
        if (completed === "true") completed = true;
        else if (completed === "false") completed = false;
        else completed = null;

        const tasks = await taskModel.getFilteredTasks(
            req.user.id,
            search || null,
            completed,
            sort || "newest"
        );

        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get task by ID 
const getTask = async (req, res) => {
    try {
        const task = await taskModel.getTaskById(req.params.id, req.user.id);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(task);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new task
const createTask = async (req, res) => {
    try {
        const { title, description } = req.body;

        const validationError = validateTaskInput(title, description);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const newTask = await taskModel.createTask(title, description, req.user.id);
        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a task
const updateTask = async (req, res) => {
    try {
        const { title, description, completed } = req.body;

        const validationError = validateTaskInput(title, description);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const updatedTask = await taskModel.updateTask(
            req.params.id,
            title,
            description,
            completed,
            req.user.id
        );

        if (!updatedTask) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json(updatedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a task
const deleteTask = async (req, res) => {
    try {
        const deletedTask = await taskModel.deleteTask(req.params.id, req.user.id);

        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Toggle completed status
const toggleTaskCompleted = async (req, res) => {
    try {
        const task = await taskModel.toggleTaskCompleted(req.params.id, req.user.id);
        if (!task) return res.status(404).json({ error: "Task not found" });
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted
};
