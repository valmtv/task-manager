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
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
    connection.release();
  }
});

app.get('/api/projects', (req, res) => {
  pool.query('SELECT * FROM Projects', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
