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
  const { name, email, role, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO Users (name, email, role, password) VALUES (?, ?, ?, ?)',
      [name, email, role, hashedPassword]
    );
    const token = jwt.sign({ id: result.insertId, name, role }, process.env.JWT_KEY , { expiresIn: '1h' });


    res.status(201).json({ id: result.insertId, message: 'User registered successfully' });
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
