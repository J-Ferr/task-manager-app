const pool = require("../db");

// Get all subtasks for a task scoped by user
const getSubtasksForTask = async (TaskEditModal, userId) => {
    const result = await pool.query(
        `
        SELECT s.*
        FROM subtasks s
        JOIN tasks t ON s.task_id = t.id
        WHERE s.task_id = $1 AND t.user_id = $2
        ORDER BY s.created_at ASC
        `,
        [TaskEditModal, userId]
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
const ToggleSubtaskCompleted =async (subtaskId, userId) => {
    const result = await pool.query(
        `
        UPDATE subtasks s
        SET completed = NOT completed
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

module.exports = {
    getSubtasksForTask,
    createSubtask,
    ToggleSubtaskCompleted,
    deleteSubtask,
};