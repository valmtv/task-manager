import React, { useEffect, useState, useContext } from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import api from '../api/api';
import NotificationContext from '../contexts/NotificationContext';

function Projects() {
  const [projects, setProjects] = useState([]);
  const { addNotification } = useContext(NotificationContext);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects');
        setProjects(response.data);
        addNotification('Projects loaded successfully!', 'Task Update');
      } catch (error) {
        console.error('Error fetching projects:', error);
        addNotification('Failed to load projects.', 'Overdue');
      }
    };
    fetchProjects();
  }, [addNotification]);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Projects
      </Typography>
      <List>
        {projects.map((project) => (
          <ListItem key={project.id}>
            <ListItemText primary={project.name} secondary={project.description} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default Projects;
