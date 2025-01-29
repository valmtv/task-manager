const express = require('express');
const router = express.Router();
const projectService = require('../services/projects.service');
const handleError = require('../utils/error.handler');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of all projects
 */
router.get('/', async (req, res) => {
  try {
    const projects = await projectService.getAllProjects();
    res.json(projects);
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     security:
 *       - bearerAuth: [] 
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *     responses:  
 *       201:
 *         description: Project created successfully
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const result = await projectService.createProject(req.body);
    res.status(201).json({ ...result, message: 'Project created successfully' });
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /api/projects/{projectId}/resources:
 *   get:
 *     summary: Get project resources
 *     security:
 *       - bearerAuth: []
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of project resources
 */
router.get('/:projectId/resources', async (req, res) => {
  try {
    const resources = await projectService.getProjectResources(req.params.projectId);
    res.json(resources);
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /api/projects/analysis:
 *   get:
 *     summary: Get project analysis
 *     security:
 *       - bearerAuth: []
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Projects analysis
 */
router.get('/analysis', async (req, res) => {
  try {
    const analysis = await projectService.getProjectAnalysis();
    res.json(analysis);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
