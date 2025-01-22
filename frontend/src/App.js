import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
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
import Projects from './components/Projects';
import Tasks from './components/Tasks';
import Notifications from './components/Notifications';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import { getAuthToken } from './api/api';
import { jwtDecode } from 'jwt-decode';

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
    }
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    handleMenuClose();
  };

  return (
    <Router>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Task Manager
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Projects
          </Button>
          <Button color="inherit" component={Link} to="/tasks">
            Tasks
          </Button>
          <Button color="inherit" component={Link} to="/notifications">
            Notifications
          </Button>
          {user ? (
            <div>
              <Button
                color="inherit"
                onClick={handleMenuOpen}
                startIcon={<Avatar/>}
              >
                {user.name}
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
          ) : (
            <Button color="inherit" onClick={() => setAuthModalOpen(true)}>
              Login / Sign Up
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container>
        <Routes>
          <Route path="/" element={<Projects />} />
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
      <AuthModal 
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        setUser={setUser}
      />
    </Router>
  );
}

export default App;
