const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const app = express();
const port = 5001;

dotenv.config();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST, 
  user: process.env.MYSQL_USER, 
  password: process.env.MYSQL_PASSWORD, 
  database: process.env.MYSQL_DATABASE, 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}).promise();

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database');
    connection.release();
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
  }
})();


app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  const role = 'Team Member';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO Users (name, email, role, password) VALUES (?, ?, ?, ?)',
      [name, email, role, hashedPassword]
    );
    const token = jwt.sign({ id: result.insertId, name, role }, process.env.JWT_KEY , { expiresIn: '1h' });


    res.status(201).json({ id: result.insertId, name, role, token, message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, process.env.JWT_KEY , { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

app.get('/api/projects', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Projects');
    res.json(rows);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Error executing query' });
  }
});

app.get('/api/users/team-members', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role FROM Users WHERE role = "Team Member" ORDER BY name'
    );
    res.json(users);
  } catch (err) {
    console.error('Error fetching team members:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  const { name, description, start_date, end_date, status } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Projects (name, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
      [name, description, start_date, end_date, status]
    );
    res.status(201).json({ id: result.insertId, message: 'Project created successfully' });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tasks', async (req, res) => {
  const { project_id } = req.query;

  try {
    let query = 'SELECT * FROM Tasks';
    const params = [];

    if (project_id) {
      query += ' WHERE project_id = ?';
      params.push(project_id);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Error executing query' });
  }
});


app.get('/api/tasks-with-dependencies', async (req, res) => {
  try {
    const query = `
      SELECT 
        t.*,
        d.dependent_task_id,
        td.name AS dependent_task_name,
        u.name AS assigned_to_name
      FROM Tasks t
      LEFT JOIN TaskDependencies d ON t.id = d.task_id
      LEFT JOIN Tasks td ON d.dependent_task_id = td.id
      LEFT JOIN Users u ON t.assigned_to = u.id
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Error executing query' });
  }
});

app.post('/api/tasks/update-status', async (req, res) => {
  const { taskId, newStatus } = req.body;
  try {
    await pool.query('UPDATE Tasks SET status = ? WHERE id = ?', [newStatus, taskId]);
    res.status(200).json({ message: 'Task status updated successfully' });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});


app.get('/api/projects/:projectId/resources', async (req, res) => {
  try {
    const [resources] = await pool.query(
      `SELECT r.id, r.name, r.type, r.quantity, r.cost
       FROM Resources r
       JOIN ProjectResources pr ON r.id = pr.resource_id
       WHERE pr.project_id = ?`,
      [req.params.projectId]
    );
    res.json(resources);
  } catch (err) {
    console.error('Error fetching project resources:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/task-dependencies', async (req, res) => {
  const { task_id, dependent_task_id } = req.body;
  try {
    await pool.query(
      'INSERT INTO TaskDependencies (task_id, dependent_task_id) VALUES (?, ?)',
      [task_id, dependent_task_id]
    );
    res.status(201).json({ message: 'Task dependency created successfully' });
  } catch (err) {
    console.error('Error creating task dependency:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/task-dependencies', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM TaskDependencies');
    res.json(rows);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Error executing query' });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { project_id, name, description, assigned_to, status, priority, due_date } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Tasks (project_id, name, description, assigned_to, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [project_id, name, description, assigned_to, status, priority, due_date]
    );
    res.status(201).json({ id: result.insertId, message: 'Task created successfully' });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  const { user_id, message, type, is_read } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Notifications (user_id, message, type, is_read) VALUES (?, ?, ?, ?)',
      [user_id, message, type, is_read || false]
    );
    res.status(201).json({ id: result.insertId, message: 'Notification added successfully' });
  } catch (err) {
    console.error('Error adding notification:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/notifications', async (req, res) => {
  const { user_id } = req.query;
  try {
    const query = `
      SELECT
        n.id,
        n.message,
        n.type,
        n.is_read,
        n.created_at,
        u.name AS user_name
      FROM Notifications n
      LEFT JOIN Users u ON n.user_id = u.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
    `;
    const [notifications] = await pool.query(query, [user_id]);
    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: err.message });
  }
});


app.patch('/api/notifications/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE Notifications SET is_read = true WHERE id = ?', [id]);
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Notifications WHERE id = ?', [id]);
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/analysis', async (req, res) => {
  try {
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
    res.json(rows);
  } catch (err) {
    console.error('Error fetching project analysis:', err.message);
    res.status(500).json({ error: 'Failed to fetch project analysis' });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
