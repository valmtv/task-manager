const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./src/config/swagger');

const authRoutes = require('./src/routes/auth.routes');
const projectRoutes = require('./src/routes/projects.routes');
const taskRoutes = require('./src/routes/tasks.routes');
const notificationRoutes = require('./src/routes/notifications.routes');
const usersRoutes = require('./src/routes/users.routes');


const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/api', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', usersRoutes);

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
