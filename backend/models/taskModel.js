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
const createTask = async (title, description, priority, due_date, userId) => {
  const result = await pool.query(
    `INSERT INTO tasks (title, description, priority, due_date, user_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [title, description, priority, due_date, userId]
  );
  return result.rows[0];
};


// Update task
const updateTask = async (id, title, description, completed, priority, due_date, userId) => {
  const result = await pool.query(
    `UPDATE tasks 
     SET title = $1, description = $2, completed = $3, priority = $4, due_date = $5
     WHERE id = $6 AND user_id = $7
     RETURNING *`,
    [title, description, completed, priority, due_date, id, userId]
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
const getFilteredTasks = async ({ userId, search, completed, sort, priority, dueDate }) => {
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const values = [userId];
    let index = 2;

    // Completed filter
    if (completed !== null) {
        query += ` AND completed = $${index}`;
        values.push(completed);
        index++;
    }

    // Search filter
    if (search) {
        query += ` AND (title ILIKE $${index} OR description ILIKE $${index})`;
        values.push(`%${search}%`);
        index++;
    }

    // Priority filter
    if (priority) {
        query += ` AND priority = $${index}`;
        values.push(priority);
        index++;
    }

    // Due date filter
    if (dueDate) {
        query += ` AND due_date = $${index}`;
        values.push(dueDate);
        index++;
    }

    // Sorting logic
switch (sort) {
  case "oldest":
    query += ` ORDER BY created_at ASC`;
    break;

  case "priority-high":
    // High > Medium > Low
    query += `
      ORDER BY 
        CASE priority
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END ASC,
        created_at DESC
    `;
    break;

  case "priority-low":
    // Low > Medium > High
    query += `
      ORDER BY 
        CASE priority
          WHEN 'low' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'high' THEN 3
        END ASC,
        created_at DESC
    `;
    break;

  case "due-soon":
    query += `
      ORDER BY 
        (due_date IS NULL) ASC,   -- Nulls last
        due_date ASC
    `;
    break;

  case "due-late":
    query += `
      ORDER BY 
        (due_date IS NULL) ASC,   -- Nulls last
        due_date DESC
    `;
    break;

  default:
    // newest
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
