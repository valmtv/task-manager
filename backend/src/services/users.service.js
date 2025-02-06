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

}

module.exports = new UsersService();
