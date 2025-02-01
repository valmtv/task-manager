import React from 'react';
import { Box, Typography, Button, Container, Paper, Grid2 } from '@mui/material';

function Welcome({ setAuthModalOpen }) {
  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, maxWidth: 600 }}>
          <Typography variant="h2" gutterBottom>
            Welcome to Task Manager
          </Typography>
          <Typography variant="h5" gutterBottom>
            Organize your projects and tasks efficiently.
          </Typography>
          <Typography variant="body1" paragraph>
            Task Manager is a powerful tool to help you manage your projects, assign tasks, and track progress. 
            Whether you're working solo or with a team, Task Manager has everything you need to stay organized.
          </Typography>
          <Grid2 container spacing={2} justifyContent="center">
            <Grid2 >
              <Button
                variant="contained"
                color="primary"
                onClick={() => setAuthModalOpen({ open: true, tab: 0 })}
                size="large"
              >
                Login
              </Button>
            </Grid2>
            <Grid2 >
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setAuthModalOpen({ open: true, tab: 1 })}
                size="large"
              >
                Sign Up
              </Button>
            </Grid2>
          </Grid2>
        </Paper>
      </Box>
    </Container>
  );
}

export default Welcome;
