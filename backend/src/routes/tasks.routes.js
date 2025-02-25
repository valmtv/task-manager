const express = require('express');
const router = express.Router();
const taskService = require('../services/tasks.service');
const handleError = require('../utils/error.handler');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     security:
 *       - bearerAuth: []
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: integer
 *         description: Optional project ID to filter tasks
 *     responses:
 *       200:
 *         description: List of tasks
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
 *     security:
 *       - bearerAuth: []
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post('/', async (req, res) => {
  try {
    const { project_id, name, description, assigned_to, priority, due_date, dependent_task_id, tags } = req.body;

    const createdTask = await taskService.createTask({
      project_id,
      name,
      description,
      priority,
      due_date,
    });

    const taskId = createdTask.id;
    if (assigned_to && assigned_to.length > 0) {
      await taskService.assignUsersToTask(taskId, Array.isArray(assigned_to) ? assigned_to : [assigned_to]);
    }
    if (dependent_task_id) {
      await taskService.addTaskDependency(taskId, dependent_task_id);
    }
    if (tags && tags.length > 0) {
      await taskService.addTaskTags(taskId, Array.isArray(tags) ? tags : [tags]);
    }

    res.status(201).json({ ...createdTask, message: 'Task created successfully' });
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /api/tasks/update-status:
 *   post:
 *     summary: Update task status
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Task status updated successfully
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
 * /api/tasks/tasks-with-dependencies:
 *   get:
 *     summary: Get all tasks with dependencies
 *     security:
 *       - bearerAuth: []
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: List of tasks with dependencies
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
 *     security:
 *       - bearerAuth: []
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - task_id
 *               - dependent_task_id
 *             properties:
 *               task_id:
 *                 type: integer
 *               dependent_task_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Task dependency created successfully
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

/**
 * @swagger
 * /api/tasks/add-tag:
 *   post:
 *     summary: Add a tag to a task
 *     security:
 *       - bearerAuth: []
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *         schema:
 *           type: object
 *           required:
 *             - task_id
 *             - tag_name
 *     responses:
 *       200:
 *         description: Tag added successfully
 */
router.post('/add-tag', async (req, res) => {
  try {
    const { task_id, tag_name } = req.body;
    await taskService.addTaskTag(task_id, tag_name);
    res.json({ message: 'Tag added successfully' });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
