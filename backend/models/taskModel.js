const pool = require('../db');

// Get all tasks
const getAllTasks = async () => {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
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


// Get tasks with filters
const getFilteredTasks = async (filters) => {
    let query = 'SELECT * FROM tasks';
    const values = [];
    const conditions = [];

    // ALWAYS filter by the logged-in user's ID
    conditions.push(`user_id = $${values.length + 1}`);
    values.push(filters.userId);

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
    toggleTaskCompleted,
    getFilteredTasks
};
