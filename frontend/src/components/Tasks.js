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

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks-with-dependencies');
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.post('/tasks/update-status', { taskId, newStatus });
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Pending':
        return {
          backgroundColor: '#f5f5f5',
          color: '#555',
          border: '1px solid #ddd',
        };
      case 'In Progress':
        return {
          backgroundColor: '#e3f2fd',
          color: '#1976d2',
          border: '1px solid #90caf9',
        };
      case 'Completed':
        return {
          backgroundColor: '#e8f5e9',
          color: '#4caf50',
          border: '1px solid #a5d6a7',
        };
      default:
        return {
          backgroundColor: '#f5f5f5',
          color: '#555',
          border: '1px solid #ddd',
        };
    }
  };

  const sortedTasks = [...tasks].sort((a, b) =>
    a.status === 'Completed' && b.status !== 'Completed' ? 1 : -1
  );

  return (
    <Box padding={3}>
      <Typography variant="h4" gutterBottom>
        Tasks
      </Typography>
      <Grid container spacing={3}>
        {sortedTasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Card elevation={3} style={getStatusStyles(task.status)}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {task.name}
                </Typography>
                <Divider light style={{ margin: '10px 0' }} />
                <Typography variant="body2" color="textSecondary">
                  <strong>Status:</strong> {task.status}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Priority:</strong> {task.priority}
                </Typography>
                {task.due_date && (
                  <Typography variant="body2" color="textSecondary">
                    <strong>Due Date:</strong>{' '}
                    {new Date(task.due_date).toLocaleDateString()}
                  </Typography>
                )}
                {task.assigned_to && (
                  <Typography variant="body2" color="textSecondary">
                    <strong>Assigned To:</strong> {task.assigned_to_name}
                  </Typography>
                )}
                <Typography variant="body2" color="textSecondary">
                  <strong>Dependency:</strong>{' '}
                  {task.dependent_task_name || 'None'}
                </Typography>
                <Box marginTop={2}>
                  <Select
                    value={task.status}
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
