const pool = require("../db");

// Get all subtasks for a task, scoped by user
const getSubtasksForTask = async (taskId, userId) => {
  const result = await pool.query(
    `
    SELECT s.*
    FROM subtasks s
    JOIN tasks t ON s.task_id = t.id
    WHERE s.task_id = $1 AND t.user_id = $2
    ORDER BY s.created_at ASC
    `,
    [taskId, userId]
  );
  return result.rows;
};

// Create a new subtask
const createSubtask = async (taskId, title, userId) => {
  const result = await pool.query(
    `
    INSERT INTO subtasks (task_id, title)
    SELECT $1, $2
    FROM tasks
    WHERE id = $1 AND user_id = $3
    RETURNING *
    `,
    [taskId, title, userId]
  );
  return result.rows[0] || null;
};

// Toggle subtask completed
const toggleSubtaskCompleted = async (subtaskId, userId) => {
  const result = await pool.query(
    `
    UPDATE subtasks s
    SET completed = NOT s.completed
    FROM tasks t
    WHERE s.id = $1
      AND s.task_id = t.id
      AND t.user_id = $2
    RETURNING s.*
    `,
    [subtaskId, userId]
  );
  return result.rows[0] || null;
};

// Delete subtask
const deleteSubtask = async (subtaskId, userId) => {
  const result = await pool.query(
    `
    DELETE FROM subtasks s
    USING tasks t
    WHERE s.id = $1
      AND s.task_id = t.id
      AND t.user_id = $2
    RETURNING s.*
    `,
    [subtaskId, userId]
  );
  return result.rows[0] || null;
};

module.exports = {
  getSubtasksForTask,
  createSubtask,
  toggleSubtaskCompleted,
  deleteSubtask,
};
