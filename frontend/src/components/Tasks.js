import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  Divider,
  Select,
  MenuItem,
} from '@mui/material';
import api from '../api/api';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState('status');

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks/tasks-with-dependencies');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.post('/tasks/update-status', { taskId, newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getStatusStyles = (status) => {
    const styles = {
      Pending: {
        backgroundColor: '#f5f5f5',
        color: '#555',
        border: '1px solid #ddd',
      },
      'In Progress': {
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        border: '1px solid #90caf9',
      },
      Completed: {
        backgroundColor: '#e8f5e9',
        color: '#4caf50',
        border: '1px solid #a5d6a7',
      },
    };
    return styles[status] || styles.Pending;
  };

  const sortedTasks = [...tasks]
    .map((task) => ({
      ...task,
      id: task.task_id,
      name: task.task_name,
      description: task.task_description,
      status: task.task_status,
      due_date: task.task_due_date,
      project_name: task.project_name,
      dependent_task_names: task.dependent_task_names
        ? task.dependent_task_names.split(',')
        : [],
      assigned_users: task.assigned_users
        ? task.assigned_users.split(',')
        : [],
      tags: task.tags ? task.tags.split(',') : [],
    }))
    .sort((a, b) => {
      if (sortBy === 'status') {
        return a.status === 'Completed' && b.status !== 'Completed' ? 1 : -1;
      } else if (sortBy === 'project') {
        return a.project_name.localeCompare(b.project_name);
      } else if (sortBy === 'due_date') {
        return new Date(a.due_date || Infinity) - new Date(b.due_date || Infinity);
      } else if (sortBy === 'dependency') {
        return a.dependent_task_names.length - b.dependent_task_names.length;
      }
      return 0;
    });

  return (
    <Box padding={3}>
      <Typography variant="h4" gutterBottom>
        Tasks
      </Typography>
      <Box marginBottom={3}>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          size="small"
          fullWidth
        >
          <MenuItem value="status">Sort by Status</MenuItem>
          <MenuItem value="project">Sort by Project</MenuItem>
          <MenuItem value="due_date">Sort by Due Date</MenuItem>
          <MenuItem value="dependency">Sort by Dependencies</MenuItem>
        </Select>
      </Box>
      <Grid container spacing={3}>
        {sortedTasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={`${task.id}-${task.status}`}>
            <Card elevation={3} style={getStatusStyles(task.status)}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {task.name || 'Unnamed Task'}
                </Typography>
                <Divider light style={{ margin: '10px 0' }} />
                {task.description && (
                  <Typography variant="body2" color="textSecondary">
                    <strong>Description:</strong> {task.description}
                  </Typography>
                )}
                <Typography variant="body2" color="textSecondary">
                  <strong>Status:</strong> {task.status || 'Pending'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Priority:</strong> {task.priority || 'Medium'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Due Date:</strong>{' '}
                  {task.due_date && new Date(task.due_date).toString() !== 'Invalid Date'
                    ? new Date(task.due_date).toLocaleDateString()
                    : 'No Due Date'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Project:</strong> {task.project_name || 'None'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Assigned To:</strong>{' '}
                  {task.assigned_users.length > 0
                    ? task.assigned_users.join(', ')
                    : 'None'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Dependency:</strong>{' '}
                  {task.dependent_task_names.length > 0
                    ? task.dependent_task_names.join(', ')
                    : 'None'}
                </Typography>
                <Box marginTop={2}>
                  <Select
                    value={task.status || 'Pending'}
                    onChange={(e) =>
                      handleStatusChange(task.id, e.target.value)
                    }
                    size="small"
                    fullWidth
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </Box>
                <Box marginTop={2}>
                  {task.tags &&
                    task.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        color="primary"
                        size="small"
                        style={{ marginRight: 5 }}
                      />
                    ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Tasks;