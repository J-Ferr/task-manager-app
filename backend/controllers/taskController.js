const taskModel =require('../models/taskModel');
const validateTaskInput = require('../utils/validateTask');

// Get all tasks
const getTasks = async (req, res) => {
    try {
        const tasks = await taskModel.getAllTasks();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
};

// Get task by ID 
const getTask = async (req, res) => {
    try {
        const filters = {
            completed: req.query.completed,
            search: req.query.search,
            sort: req.query.sort,
            order: req.query.order
        };

        const tasks = await taskModel.getFilteredTasks(filters);
        res.json(tasks);
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

        const newTask = await taskModel.createTask(title, description);
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
            completed
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
const deleteTask =async (req, res) => {
    try {
        await taskModel.deleteTask(req.params.id);
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const toggleTaskCompleted = async (req, res) => {
    try {
        const task = await taskModel.toggleCompleted(req.params.id);
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
