const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./src/config/swagger');

const authMiddleware = require('./src/middleware/auth.middleware');

const authRoutes = require('./src/routes/auth.routes');
const projectRoutes = require('./src/routes/projects.routes');
const taskRoutes = require('./src/routes/tasks.routes');
const notificationRoutes = require('./src/routes/notifications.routes');
const usersRoutes = require('./src/routes/users.routes');
const emailRoutes = require('./src/routes/email.routes');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// public routes
app.use('/api', authRoutes);

// protected routes
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/email', authMiddleware, emailRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Project Management API',
    documentation: '/api-docs',
    version: '1.0.0'
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`API documentation available on http://localhost:${port}/api-docs`);
});

