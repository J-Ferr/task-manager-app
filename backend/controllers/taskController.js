const taskModel =require('../models/taskModel');
const validateTaskInput = require('../utils/validateTask');

// Get all tasks
const getTasks = async (req, res) => {
    try {
        const tasks = await taskModel.getAllTasks(req.user.id);
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
};

// Get task by ID 
const getTask = async (req, res) => {
    try {
        // Ask the model for a task owned by THIS user
        const task = await taskModel.getTaskById(req.params.id, req.user.id);

        // If no task found OR it doesn't belong to the user → 404
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Return the task
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

        // If task does not exist OR does not belong to the user
        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


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
