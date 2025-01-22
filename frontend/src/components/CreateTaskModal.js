import React, { useState, useContext, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import api from '../api/api';
import NotificationContext from '../contexts/NotificationContext';

function CreateTaskModal({ open, onClose, projectId }) {
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const { addNotification } = useContext(NotificationContext);

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users/team-members');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching team members:', error);
        addNotification('Failed to load team members', 'error');
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  const validateForm = () => {
    const newErrors = {};
    if (!taskName.trim()) newErrors.taskName = 'Task name is required';
    if (!projectId) newErrors.projectId = 'Project ID is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateTask = async () => {
    if (!validateForm()) return;

    try {
      const newTask = {
        project_id: projectId,
        name: taskName,
        description: taskDescription || null,
        assigned_to: assignedTo || null,
        status: 'Pending',
        priority: priority,
        due_date: dueDate || null,
      };

      const response = await api.post('/tasks', newTask);
      console.log('Task created:', response.data);
      addNotification(`New task created: ${taskName}`, 'success');
      handleClose();
    } catch (error) {
      console.error('Error creating task:', error);
      addNotification('Failed to create task', 'error');
    }
  };

  const handleClose = () => {
    setTaskName('');
    setTaskDescription('');
    setAssignedTo('');
    setDueDate('');
    setPriority('Medium');
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Task</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Task Name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          margin="normal"
          error={!!errors.taskName}
          helperText={errors.taskName}
          required
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

        <FormControl fullWidth margin="normal">
          <InputLabel id="priority-label">Priority</InputLabel>
          <Select
            labelId="priority-label"
            value={priority}
            label="Priority"
            onChange={(e) => setPriority(e.target.value)}
          >
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            min: getTomorrowDate()
          }}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="assigned-to-label">Assigned To</InputLabel>
          <Select
            labelId="assigned-to-label"
            value={assignedTo}
            label="Assigned To"
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
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
