const pool = require('../config/database');

class ProjectService {
  async getAllProjects() {
    const [rows] = await pool.query('SELECT * FROM Projects');
    return rows;
  }

  async createProject(projectData) {
    const { name, description, start_date, end_date, status } = projectData;
    const [result] = await pool.query(
      'INSERT INTO Projects (name, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
      [name, description, start_date, end_date, status]
    );
    return { id: result.insertId };
  }

  async getProjectResources(projectId) {
    const [resources] = await pool.query(
      `SELECT r.id, r.name, r.type, r.quantity, r.cost
       FROM Resources r
       JOIN ProjectResources pr ON r.id = pr.resource_id
       WHERE pr.project_id = ?`,
      [projectId]
    );
    return resources;
  }

  async getProjectAnalysis() {
    const [rows] = await pool.query(`
      WITH
          task_summary AS (
              SELECT
                  p.id AS project_id,
                  COUNT(t.id) AS total_tasks,
                  SUM(t.status = 'Completed') AS completed_tasks,
                  SUM(t.status != 'Completed' AND t.due_date < CURDATE()) AS overdue_tasks
              FROM Projects p
              LEFT JOIN Tasks t ON p.id = t.project_id
              GROUP BY p.id
          ),
          resource_summary AS (
              SELECT
                  pr.project_id,
                  COUNT(pr.resource_id) AS total_resources,
                  SUM(r.quantity) AS total_quantity,
                  SUM(r.cost) AS total_cost
              FROM ProjectResources pr
              INNER JOIN Resources r ON pr.resource_id = r.id
              GROUP BY pr.project_id
          ),
          team_member_summary AS (
              SELECT
                  t.project_id,
                  t.assigned_to,
                  u.name AS team_member_name,
                  COUNT(t.id) AS tasks_assigned,
                  ROW_NUMBER() OVER (PARTITION BY t.project_id ORDER BY COUNT(t.id) DESC) AS \`rank\`
              FROM Tasks t
              LEFT JOIN Users u ON t.assigned_to = u.id
              GROUP BY t.project_id, t.assigned_to, u.name
          )
      SELECT
          p.id AS project_id,
          p.name AS project_name,
          p.status AS project_status,
          COALESCE(ts.total_tasks, 0) AS total_tasks,
          COALESCE(ts.completed_tasks, 0) AS completed_tasks,
          ROUND(COALESCE(ts.completed_tasks, 0) / COALESCE(NULLIF(ts.total_tasks, 0), 1) * 100, 2) AS completion_rate,
          COALESCE(ts.overdue_tasks, 0) AS overdue_tasks,
          COALESCE(rs.total_resources, 0) AS total_resources,
          COALESCE(rs.total_quantity, 0) AS total_resource_quantity,
          COALESCE(rs.total_cost, 0) AS total_resource_cost,
          tm.team_member_name AS top_team_member,
          tm.tasks_assigned AS top_team_member_tasks
      FROM Projects p
      LEFT JOIN task_summary ts ON p.id = ts.project_id
      LEFT JOIN resource_summary rs ON p.id = rs.project_id
      LEFT JOIN team_member_summary tm ON p.id = tm.project_id AND tm.\`rank\` = 1
      ORDER BY completion_rate DESC, overdue_tasks ASC;
    `);
    return rows;
  }
}

module.exports = new ProjectService();
