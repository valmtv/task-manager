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
  const [dependentTask, setDependentTask] = useState('');
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
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

    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks');
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        addNotification('Failed to load tasks', 'error');
      }
    };

    if (open) {
      fetchUsers();
      fetchTasks();
    }
  }, [open, addNotification]);

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
      const createdTask = response.data;

      if (dependentTask) {
        await api.post('/task-dependencies', {
          task_id: createdTask.id,
          dependent_task_id: dependentTask,
        });
        addNotification(`You have got new task assigned: ${taskName}, is dependant on: ${dependentTask}`, 'Task Update', assignedTo);
        addNotification(`You have created new task: ${taskName} for ${assignedTo}`, 'Task Update');
        handleClose();
      }
      else {

        addNotification(`You have got new task assigned: ${taskName}`, 'Task Update', assignedTo);
        addNotification(`You have created new task: ${taskName} for ${assignedTo}`, 'Task Update');
        handleClose();
      }
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
    setDependentTask('');
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
            min: getTomorrowDate(),
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

        <FormControl fullWidth margin="normal">
          <InputLabel id="dependent-task-label">Dependent Task</InputLabel>
          <Select
            labelId="dependent-task-label"
            value={dependentTask}
            label="Dependent Task"
            onChange={(e) => setDependentTask(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {tasks.map((task) => (
              <MenuItem key={task.id} value={task.id}>
                {task.name}
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
