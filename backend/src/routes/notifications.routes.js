const express = require('express');
const router = express.Router();
const notificationService = require('../services/notifications.service');
const handleError = require('../utils/error.handler');

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     security:
 *       - bearerAuth: []
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of notifications for the user 
 */
router.get('/', async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.query.user_id);
    res.json(notifications);
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a new notification
 *     security:
 *       - bearerAuth: []
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - message
 *               - type
 *             properties:
 *               user_id:
 *                 type: integer
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *               is_read:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Notification added successfully
 */
router.post('/', async (req, res) => {
  try {
    const result = await notificationService.createNotification(req.body);
    res.status(201).json({ ...result, message: 'Notification added successfully' });
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   patch:
 *     summary: Mark notification as read
 *     security:
 *       - bearerAuth: []
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.patch('/:id', async (req, res) => {
  try {
    await notificationService.markAsRead(req.params.id);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     security:
 *       - bearerAuth: []
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 */
router.delete('/:id', async (req, res) => {
  try {
    await notificationService.deleteNotification(req.params.id);
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
