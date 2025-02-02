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
}

module.exports = new UsersService();
