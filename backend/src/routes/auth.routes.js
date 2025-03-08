const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const handleError = require('../utils/error.handler');

const pool = require('../config/database');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const passport = require('passport');


/**
 * @swagger
 *   /auth/google:
 *     post:
 *       summary: Redirect to Google OAuth for authentication
 *       tags: [Auth]
 *       responses:
 *         302:
 *           description: Redirect to Google OAuth
 */ 
router.post('/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
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

    const jwtToken = jwt.sign(
      { id: user.id },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );

    res.json({ success: true, token: jwtToken, userId: user.id });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
});

/**
 * @swagger
 *   /auth/google/callback:
 *     get:
 *       summary: Google OAuth callback
 *       tags: [Auth]
 *       responses:
 *         302:
 *           description: Redirect to Google OAuth
 *           
 */
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:3000/login',
    session: false,
  }),
  (req, res) => {
    const token = process.env.JWT_KEY;
    res.redirect(`http://localhost:3000/projects?token=${token}`);
  }
);



/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.registerUser(name, email, password);
    res.status(201).json({ ...result, message: 'User registered successfully' });
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: User email or username
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token containing user details (id, name, email, role, phone_number)
 */
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const result = await authService.loginUser(identifier, password);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /api/verify-email/send-code:
 *   post:
 *     summary: Send a verification code for email confirmation
 *     tags: [Email Verification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/verify-email/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    await authService.sendVerificationCode(email, 'email_verification');
    res.json({ success: true, message: 'Verification code sent successfully' });
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /api/verify-email/confirm:
 *   post:
 *     summary: Confirm email using verification code
 *     tags: [Email Verification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired code
 *       500:
 *         description: Internal server error
 */
router.post('/verify-email/confirm', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    await authService.verifyCode(email, code, 'email_verification');
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    handleError(res, err);
  }
});


/**
 * @swagger
 * /api/reset-password/send-code:
 *   post:
 *     summary: Send a password reset code
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset code sent successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/reset-password/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const isEmailConfirmed = await authService.isEmailConfirmed(email);
    if (!isEmailConfirmed) {
      return res.status(400).json({ success: false, message: 'Email not verified' });
    }
    await authService.sendVerificationCode(email, 'password_reset');
    res.json({ success: true, message: 'Password reset code sent successfully' });
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /api/reset-password/confirm:
 *   post:
 *     summary: Confirm password reset using code
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid or expired code
 *       500:
 *         description: Internal server error
 */
router.post('/reset-password/confirm', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, code, and new password are required' });
    }

    await authService.verifyCode(email, code, 'password_reset');
    await authService.updatePassword(email, newPassword);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
