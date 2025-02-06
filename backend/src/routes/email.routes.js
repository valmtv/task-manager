const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const handleError = require('../utils/error.handler');

/**
 * @swagger
 * /api/email/change-password:
 *   post:
 *     summary: Change user's password and send confirmation email
 *     security:
 *       - bearerAuth: []
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               userId:
 *                 type: integer
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully and confirmation email sent
 *       400:
 *         description: Invalid input or current password is incorrect
 *       500:
 *         description: Internal server error
 */
router.post('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    await authService.changePassword(userId, currentPassword, newPassword);

    res.json({ success: true, message: 'Password updated successfully and confirmation email sent' });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
