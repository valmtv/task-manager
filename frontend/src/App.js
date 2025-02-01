import React, { useState, useEffect } from 'react';
import { Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import {
  CssBaseline,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import Projects from './components/Projects';
import Tasks from './components/Tasks';
import Notifications from './components/Notifications';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import Welcome from './components/Welcome';
import Profile from './components/Profile';
import { getAuthToken } from './api/api';
import { jwtDecode } from 'jwt-decode';
import AppBarUserMenu from './components/AppBarUserMenu';

function App() {
  const [authModalOpen, setAuthModalOpen] = useState({ open: false, tab: 0 });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
    }
  }, []);



  const handleLogout = async () => {
    localStorage.removeItem('token');
    await setUser(null);
    navigate('/');
  };

  return (
    <NotificationProvider userId={user ? user.id : null}>
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
              <AppBarUserMenu user={user} handleLogout={handleLogout} navigate={navigate} />
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
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile user={user} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Container>
      <AuthModal
        open={authModalOpen.open}
        onClose={() => setAuthModalOpen({ open: false, tab: 0 })}
        setUser={setUser}
        tab={authModalOpen.tab}
      />
    </NotificationProvider>
  );
}

export default App;
