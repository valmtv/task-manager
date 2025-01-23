import React, { useState, useEffect } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Button, 
  Box, 
  Paper,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import api from '../api/api';
import CreateTaskModal from './CreateTaskModal';
import ProjectAnalysis from './ProjectAnalysis';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectResources, setProjectResources] = useState([]);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

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

  useEffect(() => {
    const fetchProjectResources = async () => {
      if (selectedProject) {
        try {
          const response = await api.get(`/projects/${selectedProject.id}/resources`);
          setProjectResources(response.data);
        } catch (error) {
          console.error('Error fetching project resources:', error);
        }
      }
    };
    fetchProjectResources();
  }, [selectedProject]);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleBackClick = () => {
    setSelectedProject(null);
    setProjectResources([]);
  };

  const handleCreateTaskClick = () => {
    setIsCreateTaskModalOpen(true);
  };

  const handleCreateTaskModalClose = () => {
    setIsCreateTaskModalOpen(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Started': return 'default';
      case 'In Progress': return 'primary';
      case 'Completed': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <ProjectAnalysis />
      </Typography>

      {selectedProject ? (
        <Paper elevation={3} sx={{ padding: 3, marginTop: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                {selectedProject.name}
                <Chip 
                  label={selectedProject.status}
                  color={getStatusColor(selectedProject.status)}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Project Details</Typography>
                <Typography variant="body1" paragraph>
                  {selectedProject.description}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Start Date</Typography>
                    <Typography variant="body1">{formatDate(selectedProject.start_date)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">End Date</Typography>
                    <Typography variant="body1">{formatDate(selectedProject.end_date)}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Resources</Typography>
                {projectResources.length > 0 ? (
                  <Grid container spacing={2}>
                    {projectResources.map((resource) => (
                      <Grid item xs={12} key={resource.id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1">{resource.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {resource.type} • Quantity: {resource.quantity}
                            </Typography>
                          </Box>
                          <Typography variant="body1" color="primary">
                            {formatCurrency(resource.cost)}
                          </Typography>
                        </Box>
                        <Divider sx={{ mt: 1 }} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No resources assigned to this project
                  </Typography>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="contained" color="primary" onClick={handleCreateTaskClick}>
                  Create Task
                </Button>
                <Button variant="outlined" onClick={handleBackClick}>
                  Back to Projects
                </Button>
              </Box>
            </Grid>
          </Grid>

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
              sx={{ 
                '&:hover': { backgroundColor: '#f5f5f5' }, 
                cursor: 'pointer',
                borderRadius: 1,
                mb: 1
              }}
            >
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {project.name}
                    <Chip 
                      label={project.status}
                      color={getStatusColor(project.status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                } 
                secondary={project.description}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

export default Projects;
