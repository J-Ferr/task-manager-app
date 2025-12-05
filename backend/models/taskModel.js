const pool = require('../db');

// Get all tasks
const getAllTasks = async () => {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    return result.rows;
};

// Get a task by ID 
const getTaskById = async (id) => {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result.rows[0];
};

// Create a new task 
const createTask = async (title, description) => {
    const result = await pool.query('INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *', [title, description]);
    return result.rows[0];
};

// Update a task
const updateTask = async (id, title, description, completed) => {
    const result = await pool.query('UPDATE tasks SET title = $1, description = $2, completed = $3 WHERE id = $4 RETURNING *', [title, description, completed, id]);
    return result.rows[0];
};

// Delete a task
const deleteTask = async (id) => {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    return { message: 'Task deleted successfully' };
};

// Toggle completed
const toggleCompleted = async (id) => {
    const result = await pool.query(
        'UPDATE tasks SET completed = NOT completed WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
};

// Get tasks with filters
const getFilteredTasks = async (filters) => {
    let query = 'SELECT * FROM tasks';
    const values = [];
    const conditions = [];

    // Filter by completed
    if (filters.completed !== undefined) {
        conditions.push(`completed = $${values.length + 1}`);
        values.push(filters.completed === 'true');
    }

    // Search in title or description
    if (filters.search) {
        conditions.push(`(title ILIKE $${values.length + 1} OR description ILIKE $${values.length + 1})`);
        values.push(`%${filters.search}%`);
    }

    // Apply WHERE conditions
    if (conditions.length > 0) {
        query += 'WHERE ' + conditions.join(' AND ');
    }

    // Sorting
    if (filters.sort) {
        const order = filters.order === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${filters.sort} ${order}`;
    } else {
        query += ' ORDER BR created_at DESC';
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
    toggleCompleted,
    getFilteredTasks
};
