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
  Autocomplete,
  Chip,
  Box,
} from '@mui/material';
import api from '../api/api';
import NotificationContext from '../contexts/NotificationContext';

function CreateTaskModal({ open, onClose, projectId }) {
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dependentTask, setDependentTask] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [tags, setTags] = useState([]);
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
        const response = await api.get(`/tasks?project_id=${projectId}`);
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
  }, [open, projectId, addNotification]);

  const handleUserChange = (event, value) => {
    setSelectedUsers(value);
  };

  const handleTagAddition = (event) => {
    if (event.key === 'Enter' && event.target.value.trim() !== '') {
      const newTag = event.target.value.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      event.target.value = '';
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleCreateTask = async () => {
    try {
      const newTask = {
        project_id: projectId,
        name: taskName,
        description: taskDescription || null,
        assigned_to: selectedUsers.map((user) => user.id),
        priority: priority,
        due_date: dueDate || null,
        dependent_task_id: dependentTask || null,
        tags: tags,
      };

      const response = await api.post('/tasks', newTask);
      const createdTask = response.data;

      addNotification(`You have created new task: ${createdTask.name}`, 'Task Update');
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      addNotification('Failed to create task', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Task</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Task Name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          margin="normal"
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
        <Autocomplete
  multiple
  options={users}
  getOptionLabel={(user) => user.name}
  value={selectedUsers}
  onChange={handleUserChange}
  renderInput={(params) => (
    <TextField {...params} label="Assigned To" margin="normal" />
  )}
  renderTags={(value, getTagProps) =>
    value.map((user, index) => {
      const { key, ...rest } = getTagProps({ index });
      return (
        <Chip
          key={key}
          label={user.name}
          {...rest}
          onDelete={() => {
            setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
          }}
        />
      );
    })
  }
/>
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
        {/* Tags input */}
        <Box display="flex" alignItems="center" flexWrap="wrap" marginY={2}>
  {tags.map((tag, index) => (
    <Chip
      key={index}
      label={tag}
      onDelete={() => handleTagRemove(tag)}
      style={{ marginRight: 5, marginBottom: 5 }}
    />
  ))}
  <TextField
    fullWidth
    label="Add Tag"
    onKeyDown={handleTagAddition}
    margin="normal"
    placeholder="Press Enter to add a tag"
  />
</Box>
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