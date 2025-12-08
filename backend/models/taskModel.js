const pool = require('../db');

// Get all tasks (unused now but keeping it)
const getAllTasks = async (userId) => {
    const result = await pool.query(
        'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
    );
    return result.rows;
};

// Get a task by ID 
const getTaskById = async (id, userId) => {
    const result = await pool.query(
        'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
        [id, userId]
    );
    return result.rows[0];
};

// Create a new task 
const createTask = async (title, description, userId) => {
    const result = await pool.query(
        'INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
        [title, description, userId]
    );
    return result.rows[0];
};

// Update a task
const updateTask = async (id, title, description, completed, userId) => {
    const result = await pool.query(
        'UPDATE tasks SET title = $1, description = $2, completed = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
        [title, description, completed, id, userId]
    );
    return result.rows[0];
};

// Delete a task
const deleteTask = async (id, userId) => {
    const result = await pool.query(
        'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
    );
    return result.rows[0];
};

// Toggle completed
const toggleTaskCompleted = async (id, userId) => {
    const result = await pool.query(
        'UPDATE tasks SET completed = NOT completed WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
    );
    return result.rows[0];
};

// Get tasks with filters (THE FIXED VERSION)
const getFilteredTasks = async (userId, search, completed, sort) => {
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const values = [userId];
    let paramIndex = 2;

    // Filter by completed
    if (completed !== null) {
        query += ` AND completed = $${paramIndex++}`;
        values.push(completed);
    }

    // Search filter
    if (search) {
        query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        values.push(`%${search}%`);
        paramIndex++;
    }

    // Sorting
    if (sort === "oldest") {
        query += ` ORDER BY created_at ASC`;
    } else {
        query += ` ORDER BY created_at DESC`;
    }

    const result = await pool.query(query, values);
    return result.rows;
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
    getFilteredTasks
};

