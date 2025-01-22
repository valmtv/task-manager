import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Typography, Button, Box, Paper } from '@mui/material';
import api from '../api/api';
import CreateTaskModal from './CreateTaskModal';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  // Fetch all projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleBackClick = () => {
    setSelectedProject(null);
  };

  const handleCreateTaskClick = () => {
    setIsCreateTaskModalOpen(true);
  };

  const handleCreateTaskModalClose = () => {
    setIsCreateTaskModalOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Projects
      </Typography>

      {selectedProject ? (
        <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
          <Typography variant="h5" gutterBottom>
            {selectedProject.name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Description:</strong> {selectedProject.description}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Start Date:</strong> {selectedProject.start_date}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>End Date:</strong> {selectedProject.end_date}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Status:</strong> {selectedProject.status}
          </Typography>

          <Box sx={{ marginTop: 2 }}>
            <Button variant="contained" color="primary" onClick={handleCreateTaskClick} sx={{ marginRight: 2 }}>
              Create Task
            </Button>
            <Button variant="outlined" onClick={handleBackClick}>
              Back to Projects
            </Button>
          </Box>

          <CreateTaskModal
            open={isCreateTaskModalOpen}
            onClose={handleCreateTaskModalClose}
            projectId={selectedProject.id}
          />
        </Paper>
      ) : (
        <List>
          {projects.map((project) => (
            <ListItem
              key={project.id}
              onClick={() => handleProjectClick(project)}
              sx={{ '&:hover': { backgroundColor: '#f5f5f5' }, cursor: 'pointer' }}
            >
              <ListItemText primary={project.name} secondary={project.description} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

export default Projects;
