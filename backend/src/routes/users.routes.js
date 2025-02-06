const express = require('express');
const router = express.Router();
const usersService = require('../services/users.service');
const handleError = require('../utils/error.handler');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/users/team-members:
 *   get:
 *     summary: Get a list of all team members
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A JSON array of team members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the user
 *                   name:
 *                     type: string
 *                     description: The name of the user
 *                   email:
 *                     type: string
 *                     description: The email of the user
 *                   role:
 *                     type: string
 *                     description: The role of the user (eg. Team Member)
 */
router.get('/team-members', authMiddleware, async (req, res) => {
  try {
    const teamMembers = await usersService.getTeamMembers();
    res.json(teamMembers);
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /api/users/user:
 *   get:
 *     summary: Get the current user's data
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the user
 *                 name:
 *                   type: string
 *                   description: The name of the user
 *                 email:
 *                   type: string
 *                   description: The email of the user
 *                 role:
 *                   type: string
 *                   description: The role of the user
 *                 email_confirmed:
 *                   type: boolean
 *                   description: Whether the email is confirmed
 *                 phone_confirmed:
 *                   type: boolean
 *                   description: Whether the phone is confirmed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await usersService.getUserById(userId);
    res.json(user);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
