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
  Divider,
  Stack,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
  Fade
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import { GoogleLogin } from "@react-oauth/google";
import api, { setAuthToken, fetchUserData } from '../api/api';

function AuthModal({ open, onClose, setUser, tab }) {
  const [tabValue, setTabValue] = useState(tab || 0);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (open) {
      setTabValue(tab || 0);
      setIdentifier('');
      setPassword('');
      setName('');
      setError('');
      setSuccess('');
    }
  }, [open, tab]);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.post('/login', { identifier, password });
      const { token } = response.data;
      setAuthToken(token);
      const userData = await fetchUserData();
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        setUser(userData);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !identifier || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.post('/register', { 
        name, 
        email: identifier, 
        password 
      });
      const { token } = response.data;
      setAuthToken(token);
      const userData = await fetchUserData();
      setSuccess('Registration successful! Setting up your account...');
      setTimeout(() => {
        setUser(userData);      
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.post("/auth/google", {
        token: response.credential
      });
      
      if (res.data.success && res.data.token) {
        setAuthToken(res.data.token);
        try {
          const userData = await fetchUserData();
          setSuccess('Google login successful! Redirecting...');
          setTimeout(() => {
            setUser(userData);
            onClose();
          }, 1000);
        } catch (userDataError) {
          console.error("Error fetching user data:", userDataError);
          setError('Authentication successful but failed to load user data.');
        }
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError(error.response?.data?.message || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error("Google login failed", error);
    setError('Google login failed. Please try again.');
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
      onClose={loading ? null : onClose}
      maxWidth="xs" 
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: '1rem' },
          minHeight: { xs: '100%', sm: 'auto' }
        }
      }}
    >
      <DialogTitle sx={{ pb: 0, pt: '1rem' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          centered
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 'bold',
              fontSize: '1rem',
              py: '1rem',
              textTransform: 'none'
            }
          }}
        >
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: '1rem', sm: '1.5rem' }, pt: { xs: '1rem', sm: '1.5rem' } }}>
        {error && (
          <Fade in={!!error}>
            <Alert 
              severity="error" 
              sx={{ mb: '1rem' }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </Fade>
        )}
        
        {success && (
          <Fade in={!!success}>
            <Alert 
              severity="success" 
              sx={{ mb: '1rem' }}
            >
              {success}
            </Alert>
          </Fade>
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
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              onKeyPress={handleKeyPress}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={toggleShowPassword} 
                      edge="end"
                      disabled={loading}
                    >
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
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              margin="normal"
              onKeyPress={handleKeyPress}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              onKeyPress={handleKeyPress}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={toggleShowPassword} 
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}
        
        <Stack 
          direction="row" 
          alignItems="center" 
          sx={{ my: '1.5rem' }}
        >
          <Divider sx={{ flex: 1 }} />
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ px: '1rem' }}
          >
            OR
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Stack>
        
        <Box width="100%">
          <GoogleLogin 
            onSuccess={handleGoogleSuccess} 
            onError={handleGoogleFailure}
            useOneTap={false}
            cookiePolicy="single_host_origin"
            disabled={loading}
            theme="filled_blue"
            size="large"
            style={{ width: '100%' }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: '1.5rem', pb: '1.5rem', pt: 0, justifyContent: 'center', gap: '1rem' }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{ 
            fontWeight: 'medium', 
            px: '1.75rem',
            py: '0.5rem',
            color: 'text.secondary',
            borderRadius: '0.5rem',
            textTransform: 'none',
            fontSize: '0.9rem'
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={tabValue === 0 ? handleLogin : handleRegister} 
          color="primary"
          variant="contained"
          disabled={loading}
          sx={{ 
            fontWeight: 'bold', 
            px: '2.5rem', 
            py: '0.5rem',
            textTransform: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.9rem'
          }}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading 
            ? (tabValue === 0 ? 'Logging in...' : 'Signing up...') 
            : (tabValue === 0 ? 'Login' : 'Sign Up')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AuthModal;