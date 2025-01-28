const express = require('express');
const router = express.Router();
const usersService = require('../services/users.service');
const handleError = require('../utils/error.handler');

/**
 * @swagger
 * /api/users/team-members:
 *   get:
 *     summary: Get all team members
 *     tags: [Users]
 */
router.get('/team-members', async (req, res) => {
  try {
    const teamMembers = await usersService.getTeamMembers();
    res.json(teamMembers);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
