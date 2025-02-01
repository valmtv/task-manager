const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const handleError = require('../utils/error.handler');

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

module.exports = router;
