const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

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

app.get('/api/projects', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Projects');
    res.json(rows);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Error executing query' });
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

app.post('/api/tasks', async (req, res) => {
  const { project_id, name, description, status, priority } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Tasks (project_id, name, description, status, priority) VALUES (?, ?, ?, ?, ?)',
      [project_id, name, description, status, priority]
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
