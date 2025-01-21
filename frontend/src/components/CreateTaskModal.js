import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import api from '../api/api';
import NotificationContext from '../contexts/NotificationContext';

function CreateTaskModal({ open, onClose, projectId }) {
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const { addNotification } = useContext(NotificationContext);

  const handleCreateTask = async () => {
    try {
      const newTask = {
        project_id: projectId,
        name: taskName,
        description: taskDescription,
        status: 'Pending',
        priority: 'Medium',
      };

      // Send the new task to the backend
      const response = await api.post('/tasks', newTask);
      console.log('Task created:', response.data);

      // Add a notification
      addNotification(`New task created: ${taskName}`, 'Task Update');

      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      addNotification('Failed to create task', 'Overdue');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create New Task</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Task Name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Task Description"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          margin="normal"
          multiline
          rows={4}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleCreateTask} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateTaskModal;
