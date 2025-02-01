const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  async registerUser(name, email, password) {
    const role = 'Team Member';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      'INSERT INTO Users (name, email, role, password) VALUES (?, ?, ?, ?)',
      [name, email, role, hashedPassword]
    );
    
    return {
      id: result.insertId,
      name,
      email,
      role,
      token: jwt.sign(
        { id: result.insertId, name, email, role },
        process.env.JWT_KEY,
        { expiresIn: '1h' }
      )
    };
  }

  async loginUser(identifier, password) {
    let query = 'SELECT * FROM Users WHERE email = ? OR name = ?';
    const [users] = await pool.query(query, [identifier, identifier]);

    if (users.length === 0) {
      throw new Error('Invalid username/email or password');
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid username/email or password');
    }

    return {
      token: jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_KEY,
        { expiresIn: '1h' }
      )
    };
  }
}

module.exports = new AuthService();
