import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import api, { setAuthToken } from '../api/api';
import { jwtDecode } from 'jwt-decode';

function AuthModal({ open, onClose, setUser }) {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLogin = async () => {
    try {
      const response = await api.post('/login', { email, password });
      setAuthToken(response.data.token);
      const decoded = jwtDecode(response.data.token);
      setUser(decoded);
      onClose();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await api.post('/register', { name, email, password });
      setAuthToken(response.data.token);
      const decoded = jwtDecode(response.data.token);
      setUser(decoded);
      onClose();
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>
      </DialogTitle>
      <DialogContent>
        {tabValue === 0 ? (
          <Box>
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
            />
          </Box>
        ) : (
          <Box>
            <TextField
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={tabValue === 0 ? handleLogin : handleRegister} color="primary">
          {tabValue === 0 ? 'Login' : 'Sign Up'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AuthModal;
