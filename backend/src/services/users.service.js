const pool = require('../config/database');

class UsersService {
  /**
   * Get all users with the role of Team Member
   * @returns {Array} - List of team members
   */
  async getTeamMembers() {
    const [users] = await pool.query(
      `
      SELECT u.id, u.name, u.email, r.name AS role
      FROM Users u
      JOIN Roles r ON u.role_id = r.id
      WHERE r.name = 'Team Member'
      ORDER BY u.name
      `
    );
    return users;
  }

  /**
   * Get all users with the role of Team Member
   * @returns {Array} - List of team members
   */
  async getTeamMembers() {
    const [users] = await pool.query(
      `
      SELECT u.id, u.name, u.email, r.name AS role
      FROM Users u
      JOIN Roles r ON u.role_id = r.id
      WHERE r.name = 'Team Member'
      ORDER BY u.name
      `
    );
    return users;
  }

  /**
   * Get the current user's data by ID
   * @param {number} userId - The ID of the user
   * @returns {Object} - User data including confirmation status
   */
  async getUserById(userId) {
    try {
      const [users] = await pool.query(
        `
        SELECT u.id, u.name, u.email, r.name AS role
        FROM Users u
        JOIN Roles r ON u.role_id = r.id
        WHERE u.id = ?
        `,
        [userId]
      );
      if (users.length === 0) {
        throw new Error('User not found');
      }
      const user = users[0];
      const [confirmations] = await pool.query('SELECT type, confirmed_at FROM Confirmations WHERE user_id = ?', [userId]);
      const confirmationStatus = {};
      confirmations.forEach(({ type, confirmed_at }) => {
        confirmationStatus[type] = !!confirmed_at;
      });

      return {
        ...user,
        email_confirmed: confirmationStatus.email,
        phone_confirmed: confirmationStatus.phone,
      };

    } catch (err) {
      throw err;
    }
  }

  /**
   * Update the user's name
   * @param {number} userId - The ID of the user
   * @param {string} name - The new name
   */
  async updateName(userId, name) {
    await pool.query('UPDATE Users SET name = ? WHERE id = ?', [name, userId]);
  }

  /**
   * Update the user's email
   * @param {number} userId - The ID of the user
   * @param {string} email - The new email
   */
  async updateEmail(userId, email) {
    const [existingUsers] = await pool.query('SELECT id FROM Users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      throw new Error('Email is already in use');
    }
    await pool.query('UPDATE Users SET email = ? WHERE id = ?', [email, userId]);
    await pool.query('DELETE FROM Confirmations WHERE user_id = ? AND type = ?', [userId, 'email']);
  }

  /**
   * Update the user's phone number
   * @param {number} userId - The ID of the user
   * @param {string} phone_number - The new phone number
   */
  async updatePhone(userId, phone_number) {
    const [existingUsers] = await pool.query('SELECT id FROM Users WHERE phone_number = ?', [phone_number]);
    if (existingUsers.length > 0) {
      throw new Error('Phone number is already in use');
    }
    await pool.query('UPDATE Users SET phone_number = ? WHERE id = ?', [phone_number, userId]);
  }

}

module.exports = new UsersService();
