const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const handleError = require('../utils/error.handler');

/**
 * @swagger 
 * /api/email/send-verification-code:
 *   post:
 *     summary: Send a verification code to the user's email
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 */
router.post('/send-verification-code', async (req, res) => {
  try {
    const { email, type } = req.body;
    await authService.sendVerificationCode(email, type);
    res.status(200).send('Verification code sent successfully');
  } catch (error) {
    handleError(error, res);
  }
});

module.exports = router;
