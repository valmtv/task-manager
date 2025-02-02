const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  /**
   * Register a new user
   * @param {string} name - User's name
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Object} - User details and JWT token
   */
  async registerUser(name, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [roles] = await pool.query('SELECT id FROM Roles WHERE name = ?', ['Team Member']);
    if (roles.length === 0) {
      throw new Error('Role not found');
    }
    const roleId = roles[0].id;

    const [result] = await pool.query(
      'INSERT INTO Users (name, email, role_id, password) VALUES (?, ?, ?, ?)',
      [name, email, roleId, hashedPassword]
    );

    return {
      id: result.insertId,
      name,
      email,
      role: 'Team Member',
      token: jwt.sign(
        { id: result.insertId, name, email, role: 'Team Member' },
        process.env.JWT_KEY,
        { expiresIn: '1h' }
      ),
    };
  }

  /**
   * Login a user
   * @param {string} identifier - User's email or username
   * @param {string} password - User's password
   * @returns {Object} - JWT token
   */
  async loginUser(identifier, password) {
    let query = `
      SELECT u.id, u.name, u.email, u.phone_number, u.password, r.name AS role
      FROM Users u
      JOIN Roles r ON u.role_id = r.id
      WHERE u.email = ? OR u.name = ?
    `;
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
        { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role, 
          phone_number: user.phone_number || null
        },
        process.env.JWT_KEY,
        { expiresIn: '1h' }
      ),
    };
  }
}

module.exports = new AuthService();
