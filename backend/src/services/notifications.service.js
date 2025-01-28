const pool = require('../config/database');

class NotificationService {
  async createNotification(notificationData) {
    const { user_id, message, type, is_read } = notificationData;
    const [result] = await pool.query(
      'INSERT INTO Notifications (user_id, message, type, is_read) VALUES (?, ?, ?, ?)',
      [user_id, message, type, is_read || false]
    );
    return { id: result.insertId };
  }

  async getUserNotifications(userId) {
    const [notifications] = await pool.query(
      `SELECT
        n.id,
        n.message,
        n.type,
        n.is_read,
        n.created_at,
        u.name AS user_name
      FROM Notifications n
      LEFT JOIN Users u ON n.user_id = u.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC`,
      [userId]
    );
    return notifications;
  }

  async markAsRead(notificationId) {
    await pool.query('UPDATE Notifications SET is_read = true WHERE id = ?', [notificationId]);
  }

  async deleteNotification(notificationId) {
    await pool.query('DELETE FROM Notifications WHERE id = ?', [notificationId]);
  }
}

module.exports = new NotificationService();
