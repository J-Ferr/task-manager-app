const pool = require('../db');

// Get a single task
const getTaskById = async (id, userId) => {
    const result = await pool.query(
        'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
        [id, userId]
    );
    return result.rows[0];
};

// Create a new task 
const createTask = async (title, description, priority, userId) => {
    const result = await pool.query(
        'INSERT INTO tasks (title, description, priority, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, description, priority, userId]
    );
    return result.rows[0];
};

// Update task
const updateTask = async (id, title, description, completed, priority, userId) => {
    const result = await pool.query(
        'UPDATE tasks SET title = $1, description = $2, completed = $3, priority = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
        [title, description, completed, priority, id, userId]
    );
    return result.rows[0];
};

// Delete task
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

// Filtered tasks
const getFilteredTasks = async ({ userId, search, completed, sort, priority }) => {
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const values = [userId];
    let paramIndex = 2;

    if (completed !== null) {
        query += ` AND completed = $${paramIndex}`;
        values.push(completed);
        paramIndex++;
    }

    if (priority) {
        query += ` AND priority = $${paramIndex}`;
        values.push(priority);
        paramIndex++;
    }

    if (search) {
        query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        values.push(`%${search}%`);
        paramIndex++;
    }

    if (sort === "oldest") {
        query += ` ORDER BY created_at ASC`;
    } else {
        query += ` ORDER BY created_at DESC`;
    }

    const result = await pool.query(query, values);
    return result.rows;
};

module.exports = {
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
    getFilteredTasks
};
