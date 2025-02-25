import React, { useState, useEffect } from 'react';
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
  IconButton,
  InputAdornment,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import api, { setAuthToken, fetchUserData } from '../api/api';

function AuthModal({ open, onClose, setUser, tab }) {
  const [tabValue, setTabValue] = useState(tab || 0);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTabValue(tab || 0);
      setIdentifier('');
      setPassword('');
      setName('');
      setError('');
    }
  }, [open, tab]);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      const response = await api.post('/login', { identifier, password });
      const { token } = response.data;
      setAuthToken(token);
      const userData = await fetchUserData();
      setUser(userData);
      onClose();
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegister = async () => {
    if (!name || !identifier || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');      
      const response = await api.post('/register', { 
        name, 
        email: identifier, 
        password 
      });
      const { token } = response.data;
      setAuthToken(token);
      const userData = await fetchUserData();
      setUser(userData);      
      onClose();
      
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      if (tabValue === 0) {
        handleLogin();
      } else {
        handleRegister();
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs" 
      fullWidth
    >
      <DialogTitle>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2, mt: 1 }}>
            {error}
          </Typography>
        )}
        
        {tabValue === 0 ? (
          <Box>
            <TextField
              fullWidth
              label="Username or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              margin="normal"
              onKeyPress={handleKeyPress}
              autoFocus
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowPassword} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}              
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
              onKeyPress={handleKeyPress}
              autoFocus
            />
            <TextField
              fullWidth
              label="Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              margin="normal"
              onKeyPress={handleKeyPress}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowPassword} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button 
          onClick={tabValue === 0 ? handleLogin : handleRegister} 
          color="primary"
        >
          {tabValue === 0 ? 'Login' : 'Sign Up'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AuthModal;