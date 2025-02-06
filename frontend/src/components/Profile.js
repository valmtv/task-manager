import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
} from '@mui/material';
import api from '../api/api';

function Profile({ user }) {
  const [openModal, setOpenModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    try {
      await api.post('/change-password', {
        userId: user.id,
        currentPassword,
        newPassword,
      });
      setSuccess(true);
      setError('');
      setOpenModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while changing the password');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h5" gutterBottom>
            Profile Information
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Name:
          </Typography>
          <TextField
            fullWidth
            value={user?.name || 'N/A'}
            InputProps={{
              readOnly: true,
            }}
            margin="normal"
          />
          <Typography variant="subtitle1" gutterBottom>
            Email:
          </Typography>
          <TextField
            fullWidth
            value={user?.email || 'N/A'}
            InputProps={{
              readOnly: true,
            }}
            margin="normal"
          />
          <Typography variant="subtitle1" gutterBottom>
            Role:
          </Typography>
          <TextField
            fullWidth
            value={user?.role || 'N/A'}
            InputProps={{
              readOnly: true,
            }}
            margin="normal"
          />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box>
          <Button variant="outlined" color="secondary" onClick={() => setOpenModal(true)}>
            Change Password
          </Button>
        </Box>
      </Paper>
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Password updated successfully!</Alert>}
          <TextField
            fullWidth
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleChangePassword} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Profile;
