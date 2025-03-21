const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('./email.service');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
  /**
   * Register a new user
   * @param {string} name - User's name
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Object} - User ID and JWT token
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
    const userId = result.insertId;
  
    return {
      token: jwt.sign(
        { id: userId },
        process.env.JWT_KEY,
        { expiresIn: '1h' }
      ),
      userId: userId
    };
  }

  /**
   * Login a user
   * @param {string} identifier - User's email or username
   * @param {string} password - User's password
   * @returns {Object} - JWT token and user ID
   */
  async loginUser(identifier, password) {
    let query = `
      SELECT u.id, u.password
      FROM Users u
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
        { id: user.id },
        process.env.JWT_KEY,
        { expiresIn: '1h' }
      ),
      userId: user.id
    };
  }

  /**
   * Authenticate user with Google
   * @param {string} token - Google ID token
   * @returns {Object} - JWT token and user ID
   */
  async googleAuth(token) {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const [rows] = await pool.query(
      'SELECT * FROM Users WHERE email = ?',
      [email]
    );

    let user;
    if (rows.length > 0) {
      user = rows[0];
    } else {
      const [roles] = await pool.query('SELECT id FROM Roles WHERE name = ?', ['Team Member']);
      const roleId = roles[0].id;
      const [result] = await pool.query(
        'INSERT INTO Users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
        [name, email, '', roleId]
      );

      user = { id: result.insertId, name, email, role_id: roleId };
    }

    return {
      token: jwt.sign(
        { id: user.id },
        process.env.JWT_KEY,
        { expiresIn: '1h' }
      ),
      userId: user.id
    };
  }

  /**
   * Send a verification code to the user's email
   * @param {string} email - User's email address
   * @param {string} type - Type of code ('email_verification' or 'password_reset')
   */
  async sendVerificationCode(email, type) {
    const [users] = await pool.query('SELECT id FROM Users WHERE email = ?', [email]);
    if (users.length === 0) {
      throw new Error('User not found');
    }
    const user = users[0];
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await pool.query(
      'INSERT INTO VerificationCodes (user_id, code, type, expires_at) VALUES (?, ?, ?, ?)',
      [user.id, code, type, expiresAt]
    );
    await emailService.sendVerificationCode(email, code, type);
  }

  /**
   * Verify a one-time code
   * @param {string} email - User's email address
   * @param {string} code - Verification code
   * @param {string} type - Type of code ('email_verification' or 'password_reset')
   */
  async verifyCode(email, code, type) {
    const [users] = await pool.query('SELECT id FROM Users WHERE email = ?', [email]);
    if (users.length === 0) {
      throw new Error('User not found');
    }
    const user = users[0];
    const [codes] = await pool.query(
      'SELECT * FROM VerificationCodes WHERE user_id = ? AND code = ? AND type = ? AND used = FALSE AND expires_at > NOW()',
      [user.id, code, type]
    );
    if (codes.length === 0) {
      throw new Error('Invalid or expired code');
    }
    await pool.query('UPDATE VerificationCodes SET used = TRUE WHERE id = ?', [codes[0].id]);
    if (type === 'email_verification') {
      await pool.query(
        'INSERT INTO Confirmations (user_id, type, confirmed_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE confirmed_at = NOW()',
        [user.id, 'email']
      );
    }
  }

  /**
   * Update the user's password after verifying the reset code
   * @param {string} email - User's email address
   * @param {string} newPassword - New password
   */
  async updatePassword(email, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE Users SET password = ? WHERE email = ?', [hashedPassword, email]);
  }

   /**
    * Check if the user's email is confirmed
    * @param {string} email - User's email address
    * @returns {boolean} - Whether the email is confirmed
    */
    async isEmailConfirmed(email) {
      const [confirmations] = await pool.query(
        'SELECT confirmed_at FROM Confirmations WHERE user_id = (SELECT id FROM Users WHERE email = ?) AND type = ?',
        [email, 'email']
      );
      return confirmations[0]?.confirmed_at != null;
    }
}

module.exports = new AuthService();