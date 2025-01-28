const pool = require('../config/database');

class TaskService {
  async getAllTasks(projectId = null) {
    let query = 'SELECT * FROM Tasks';
    const params = [];

    if (projectId) {
      query += ' WHERE project_id = ?';
      params.push(projectId);
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  async createTask(taskData) {
    const { project_id, name, description, assigned_to, status, priority, due_date } = taskData;
    const [result] = await pool.query(
      'INSERT INTO Tasks (project_id, name, description, assigned_to, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [project_id, name, description, assigned_to, status, priority, due_date]
    );
    return { id: result.insertId };
  }

  async updateTaskStatus(taskId, newStatus) {
    await pool.query('UPDATE Tasks SET status = ? WHERE id = ?', [newStatus, taskId]);
  }

  async getTasksWithDependencies() {
    const [rows] = await pool.query(`
      SELECT 
        t.*,
        d.dependent_task_id,
        td.name AS dependent_task_name,
        u.name AS assigned_to_name
      FROM Tasks t
      LEFT JOIN TaskDependencies d ON t.id = d.task_id
      LEFT JOIN Tasks td ON d.dependent_task_id = td.id
      LEFT JOIN Users u ON t.assigned_to = u.id
    `);
    return rows;
  }

  async createTaskDependency(taskId, dependentTaskId) {
    await pool.query(
      'INSERT INTO TaskDependencies (task_id, dependent_task_id) VALUES (?, ?)',
      [taskId, dependentTaskId]
    );
  }
}

module.exports = new TaskService();
