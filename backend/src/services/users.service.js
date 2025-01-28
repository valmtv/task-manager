const pool = require('../config/database');

class UsersService {
  async getTeamMembers() {
    const [users] = await pool.query(
      'SELECT id, name, email, role FROM Users WHERE role = "Team Member" ORDER BY name'
    );
    return users;
  }
}

module.exports = new UsersService();
