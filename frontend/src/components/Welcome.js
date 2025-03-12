import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Stack,
  useMediaQuery,
  useTheme,
  Fade
} from '@mui/material';
import TaskIcon from '@mui/icons-material/AssignmentTurnedIn';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

function Welcome({ setAuthModalOpen }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Container maxWidth="lg" sx={{ height: '100vh' }}>
      <Fade in={true} timeout={800}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            py: 4,
            px: { xs: 2, sm: 3 },
          }}
        >
          <Paper 
            elevation={4} 
            sx={{ 
              width: '100%',
              maxWidth: 600,
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <Box 
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'primary.contrastText',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}
            >
              <TaskIcon fontSize="large" />
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                component="h1" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
              >
                Task Manager
              </Typography>
            </Box>
            
            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              <Typography 
                variant="h4" 
                component="h2" 
                gutterBottom 
                align="center"
                sx={{ 
                  mb: 3,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                  fontWeight: 500
                }}
              >
                Welcome to Task Manager
              </Typography>
              
              <Typography 
                variant="h6" 
                gutterBottom 
                align="center" 
                color="primary"
                sx={{ 
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                Organize your projects and tasks efficiently.
              </Typography>
              
              <Typography 
                variant="body1" 
                paragraph 
                align="center"
                sx={{ 
                  mb: 4,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  lineHeight: 1.6
                }}
              >
                Task Manager is a powerful tool to help you manage your projects, assign tasks, and track progress. 
                Whether you're working solo or with a team, Task Manager has everything you need to stay organized.
              </Typography>
              
              <Stack 
                direction={isMobile ? "column" : "row"} 
                spacing={2} 
                justifyContent="center"
                sx={{ mt: 3 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setAuthModalOpen({ open: true, tab: 0 })}
                  size="large"
                  sx={{ 
                    px: { xs: 2, sm: 4 }, 
                    py: 1.5,
                    fontWeight: 'bold',
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                  startIcon={<LockOpenIcon />}
                  fullWidth={isMobile}
                >
                  Login
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setAuthModalOpen({ open: true, tab: 1 })}
                  size="large"
                  sx={{ 
                    px: { xs: 2, sm: 4 }, 
                    py: 1.5,
                    fontWeight: 'bold',
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                  startIcon={<PersonAddIcon />}
                  fullWidth={isMobile}
                >
                  Sign Up
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
}

export default Welcome;