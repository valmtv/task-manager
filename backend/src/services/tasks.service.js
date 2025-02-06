const pool = require('../config/database');

class TaskService {
  /**
   * Get all tasks
   * @param {number} projectId - Optional project ID to filter tasks
   * @returns {Promise<Array>} - List of tasks
   */
  async getAllTasks(projectId = null) {
    let query = `
      SELECT t.*, GROUP_CONCAT(ta.user_id) AS assigned_users
      FROM Tasks t
      LEFT JOIN TaskAssignments ta ON t.id = ta.task_id
      `;
    const params = [];
    if (projectId) {
      query += ' WHERE t.project_id = ?';
      params.push(projectId);
    }
    query += ' GROUP BY t.id ORDER BY t.id';
    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Create a new task
   * @param {Object} taskData - Data for the new task
   * @returns {Object} - ID of the created task
   */
  async createTask(taskData) {
    const { project_id, name, description, priority, due_date } = taskData;
    const [result] = await pool.query(
      'INSERT INTO Tasks (project_id, name, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)',
      [project_id, name, description || null, 'Pending', priority, due_date || null]
    );
    return { id: result.insertId };
  }

  /**
   * Assign users to a task
   * @param {number} taskId - ID of the task
   * @param {Array<number>} userIds - List of user IDs
   * @returns {Promise} - Promise object represents the result of the query
   */
  async assignUsersToTask(taskId, userIds) {
    if (!userIds || userIds.length === 0) return;
    const values = userIds.map((userId) => [taskId, userId]);
    await pool.query('INSERT INTO TaskAssignments (task_id, user_id) VALUES ?', [values]);
  }

  /**
   * Add task dependencies
   * @param {number} taskId - ID of the task
   * @param {number} dependentTaskId - ID of the dependent task
   */
  async addTaskDependency(taskId, dependentTaskId) {
    await pool.query('INSERT INTO TaskDependencies (task_id, dependent_task_id) VALUES (?, ?)', [
      taskId,
      dependentTaskId,
    ]);
  }

  /**
   * Add tags to a task
   * @param {number} taskId - ID of the task
   * @param {Array<string>} tagNames - List of tag names
   * @returns {Promise} - Promise object represents the result of the query
   */
  async addTaskTags(taskId, tagNames) {
    if (!tagNames || tagNames.length === 0) return;

    const tagInserts = tagNames.map(async (tagName) => {
      const [tag] = await pool.query(
        'INSERT INTO Tags (name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
        [tagName]
      );
      const tagId = tag.insertId;
      await pool.query('INSERT INTO TaskTags (task_id, tag_id) VALUES (?, ?)', [taskId, tagId]);
    });
    await Promise.all(tagInserts);
  }

  /**
   * Update task status
   * @param {number} taskId - ID of the task
   * @param {string} newStatus - New status for the task
   */
  async updateTaskStatus(taskId, newStatus) {
    await pool.query('UPDATE Tasks SET status = ? WHERE id = ?', [newStatus, taskId]);
  }

  /**
   * Get all tasks with dependencies
   * @returns {Promise<Array>} - List of tasks with dependencies
   */
  async getTasksWithDependencies() {
    const [rows] = await pool.query(`
      SELECT
        t.id AS task_id,
        t.name AS task_name,
        t.description AS task_description,
        t.status AS task_status,
        t.priority AS task_priority,
        t.due_date AS task_due_date,
        p.name AS project_name, -- Include project name
        GROUP_CONCAT(DISTINCT d.dependent_task_id) AS dependent_task_ids,
        GROUP_CONCAT(DISTINCT td.name) AS dependent_task_names,
        GROUP_CONCAT(DISTINCT u.name) AS assigned_users,
        GROUP_CONCAT(DISTINCT tg.name) AS tags
      FROM Tasks t
      LEFT JOIN Projects p ON t.project_id = p.id
      LEFT JOIN TaskDependencies d ON t.id = d.task_id
      LEFT JOIN Tasks td ON d.dependent_task_id = td.id
      LEFT JOIN TaskAssignments ta ON t.id = ta.task_id
      LEFT JOIN Users u ON ta.user_id = u.id
      LEFT JOIN TaskTags tt ON t.id = tt.task_id
      LEFT JOIN Tags tg ON tt.tag_id = tg.id
      GROUP BY t.id, t.name, t.description, t.status, t.priority, t.due_date, p.name;
    `);
    return rows;
  }

  /**
   * Create a task dependency
   * @param {number} taskId - ID of the task
   * @param {number} dependentTaskId - ID of the dependent task
   */
  async createTaskDependency(taskId, dependentTaskId) {
    await pool.query(
      'INSERT INTO TaskDependencies (task_id, dependent_task_id) VALUES (?, ?)',
      [taskId, dependentTaskId]
    );
  }

  /**
   * Get all tasks with tags
   * @returns {Array} - List of tasks with tags
   */
  async addTaskTag(taskId, tagName) {
    const [tag] = await pool.query(
      'INSERT INTO Tags (name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
      [tagName]
    );
    const tagId = tag.insertId;
    await pool.query('INSERT INTO TaskTags (task_id, tag_id) VALUES (?, ?)', [
      taskId,
      tagId,
    ]);
  }
}

module.exports = new TaskService();
