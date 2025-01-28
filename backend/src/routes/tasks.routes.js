const express = require('express');
const router = express.Router();
const taskService = require('../services/tasks.service');
const handleError = require('../utils/error.handler');

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: integer
 *         description: Optional project ID to filter tasks
 */
router.get('/', async (req, res) => {
  try {
    const tasks = await taskService.getAllTasks(req.query.project_id);
    res.json(tasks);
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - name
 *             properties:
 *               project_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               assigned_to:
 *                 type: integer
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 */
router.post('/', async (req, res) => {
  try {
    const result = await taskService.createTask(req.body);
    res.status(201).json({ ...result, message: 'Task created successfully' });
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /api/tasks/update-status:
 *   post:
 *     summary: Update task status
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - newStatus
 *             properties:
 *               taskId:
 *                 type: integer
 *               newStatus:
 *                 type: string
 */
router.post('/update-status', async (req, res) => {
  try {
    const { taskId, newStatus } = req.body;
    await taskService.updateTaskStatus(taskId, newStatus);
    res.json({ message: 'Task status updated successfully' });
  } catch (err) {
    handleError(res, err);
  }
});

/**
* @swagger
* /api/task-dependencies:
*  post:
*    summary: Create a task dependency
*    tags: [Tasks]
*    requestBody:
*      required: true
*      content:
*        application/json:
*          schema:
*            type: object
*            required:
*              - task_id
*              - dependent_task_id
*            properties:
*              task_id:
*                type: integer
*              dependent_task_id:
*                type: integer
*/
router.get('/tasks-with-dependencies', async (req, res) => {
  try {
    const tasks = await taskService.getTasksWithDependencies();
    res.json(tasks);
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /api/task-dependencies:
 *   post:
 *     summary: Create a task dependency
 *     tags: [Tasks]
 */
router.post('/task-dependencies', async (req, res) => {
  try {
    const { task_id, dependent_task_id } = req.body;
    await taskService.createTaskDependency(task_id, dependent_task_id);
    res.status(201).json({ message: 'Task dependency created successfully' });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
