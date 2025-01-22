import React, { useState, useEffect } from 'react';
import { Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom';

import {
  CssBaseline,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import Projects from './components/Projects';
import Tasks from './components/Tasks';
import Notifications from './components/Notifications';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import Welcome from './components/Welcome';
import { getAuthToken } from './api/api';
import { jwtDecode } from 'jwt-decode';

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
    }
  }, []);



  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    localStorage.removeItem('token');
    await setUser(null);
    handleMenuClose();
    navigate('/');
  };

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Button
            color="inherit"
            component={Link}
            to="/"
            sx={{ flexGrow: 1, textTransform: 'none', justifyContent: 'flex-start' }}
          >
            <Typography variant="h6">Task Manager</Typography>
          </Button>
          {user ? (
            <>
              <Button color="inherit" component={Link} to="/projects">
                Projects
              </Button>
              <Button color="inherit" component={Link} to="/tasks">
                Tasks
              </Button>
              <Button color="inherit" component={Link} to="/notifications">
                Notifications
              </Button>
              <div>
                <Button
                  color="inherit"
                  onClick={handleMenuOpen}
                  startIcon={<Avatar><PersonIcon /></Avatar>}
                >
                  {user.name || 'User'}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem disabled>
                    <Typography variant="body2" color="textSecondary">
                      {user.role}
                    </Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </div>
            </>
          ) : null}
        </Toolbar>
      </AppBar>
      <Container>
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/projects" /> : <Welcome setAuthModalOpen={setAuthModalOpen} />}
          />
          <Route path="/projects" element={<Projects />} />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Container>
      <AuthModal open={authModalOpen.open} onClose={() => setAuthModalOpen({ open: false })} setUser={setUser} tab={authModalOpen.tab} />
    </>
  );
}

export default App;
