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
  let query = `
    SELECT
      t.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', s.id,
            'title', s.title,
            'completed', s.completed
          )
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'
      ) AS subtasks
    FROM tasks t
    LEFT JOIN subtasks s ON s.task_id = t.id
    WHERE t.user_id = $1
  `;

  const values = [userId];
  let index = 2;

  // Completed filter
  if (completed !== null) {
    query += ` AND t.completed = $${index}`;
    values.push(completed);
    index++;
  }

  // Search filter
  if (search) {
    query += ` AND (t.title ILIKE $${index} OR t.description ILIKE $${index})`;
    values.push(`%${search}%`);
    index++;
  }

  // Priority filter
  if (priority) {
    query += ` AND t.priority = $${index}`;
    values.push(priority);
    index++;
  }

  // Due date filter
  if (dueDate) {
    query += ` AND t.due_date = $${index}`;
    values.push(dueDate);
    index++;
  }

  // Group by task (required for json_agg)
  query += ` GROUP BY t.id `;

  // Sorting options
  switch (sort) {
    case "oldest":
      query += ` ORDER BY t.created_at ASC`;
      break;

    case "priority-high":
      query += `
        ORDER BY
          CASE t.priority
            WHEN 'high' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'low' THEN 3
          END ASC,
          t.created_at DESC
      `;
      break;

    case "priority-low":
      query += `
        ORDER BY
          CASE t.priority
            WHEN 'low' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'high' THEN 3
          END ASC,
          t.created_at DESC
      `;
      break;

    case "due-soon":
      query += `
        ORDER BY
          (t.due_date IS NULL) ASC,
          t.due_date ASC
      `;
      break;

    case "due-late":
      query += `
        ORDER BY
          (t.due_date IS NULL) ASC,
          t.due_date DESC
      `;
      break;

    default:
      query += ` ORDER BY t.created_at DESC`;
  }

  const { rows } = await require("../db").query(query, values);
  return rows;
};


module.exports = {
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
    getFilteredTasks
};
