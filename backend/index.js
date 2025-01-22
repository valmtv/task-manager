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
  try {
    const [rows] = await pool.query('SELECT * FROM Tasks');
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





app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
