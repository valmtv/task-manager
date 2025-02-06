import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  IconButton,
  Tooltip,
  Grid,
  Divider,
  Chip,
  TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import api from '../api/api';

function Profile({ user }) {
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState('');
  const [originalValue, setOriginalValue] = useState('');

  const startEditing = (field, value) => {
    setEditingField(field);
    setEditedValue(value);
    setOriginalValue(value);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditedValue(originalValue);
  };

  const saveChanges = async (field) => {
    if (field === 'password') {
      try {
        await api.post('/email/change-password', {
          userId: user.id,
          currentPassword: originalValue,
          newPassword: editedValue,
        });
        alert('Password updated successfully');
      } catch (error) {
        console.error('Error updating password:', error);
        alert('Failed to update password');
      }
    }

    setEditingField(null);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <PersonIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Profile Information
          </Typography>
        </Box>
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  Name:
                </Typography>
                {editingField === 'name' ? (
                  <Box display="flex" alignItems="center">
                    <TextField
                      size="small"
                      value={editedValue}
                      onChange={(e) => setEditedValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveChanges('name');
                        if (e.key === 'Escape') cancelEditing();
                      }}
                      autoFocus
                    />
                    <IconButton onClick={() => saveChanges('name')}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={cancelEditing}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center">
                    <Typography variant="body1" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                      {user?.name || 'Not Set'}
                    </Typography>
                    <Tooltip title="Edit Name">
                      <IconButton onClick={() => startEditing('name', user?.name || '')}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  Email:
                </Typography>
                {editingField === 'email' ? (
                  <Box display="flex" alignItems="center">
                    <TextField
                      size="small"
                      value={editedValue}
                      onChange={(e) => setEditedValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveChanges('email');
                        if (e.key === 'Escape') cancelEditing();
                      }}
                      autoFocus
                    />
                    <IconButton onClick={() => saveChanges('email')}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={cancelEditing}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center">
                    <Typography variant="body1" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                      {user?.email || 'Not Set'}
                    </Typography>
                    <Tooltip title="Edit Email">
                      <IconButton onClick={() => startEditing('email', user?.email || '')}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  Phone Number:
                </Typography>
                {editingField === 'phone_number' ? (
                  <Box display="flex" alignItems="center">
                    <TextField
                      size="small"
                      value={editedValue}
                      onChange={(e) => setEditedValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveChanges('phone_number');
                        if (e.key === 'Escape') cancelEditing();
                      }}
                      autoFocus
                    />
                    <IconButton onClick={() => saveChanges('phone_number')}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={cancelEditing}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center">
                    <Typography variant="body1" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                      {user?.phone_number || 'Not Set'}
                    </Typography>
                    <Tooltip title="Set Phone Number">
                      <IconButton onClick={() => startEditing('phone_number', user?.phone_number || '')}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Security Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  Password:
                </Typography>
                {editingField === 'password' ? (
                  <Box display="flex" alignItems="center">
                    <TextField
                      size="small"
                      type="password"
                      value={editedValue}
                      onChange={(e) => setEditedValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveChanges('password');
                        if (e.key === 'Escape') cancelEditing();
                      }}
                      autoFocus
                    />
                    <IconButton onClick={() => saveChanges('password')}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={cancelEditing}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center">
                    <Typography variant="body1" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                      ********
                    </Typography>
                    <Tooltip title="Change Password">
                      <IconButton onClick={() => startEditing('password', '')}>
                        <LockIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  Email Confirmation:
                </Typography>
                <Chip
                  label={user?.email_confirmed ? 'Confirmed' : 'Not Confirmed'}
                  size="small"
                  color={user?.email_confirmed ? 'success' : 'warning'}
                  sx={{ mr: 2 }}
                />
                {!user?.email_confirmed && (
                  <Button variant="outlined" size="small" startIcon={<EmailIcon />}>
                    Confirm Email
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  Phone Confirmation:
                </Typography>
                <Chip
                  label={user?.phone_confirmed ? 'Confirmed' : 'Not Confirmed'}
                  size="small"
                  color={user?.phone_confirmed ? 'success' : 'warning'}
                  sx={{ mr: 2 }}
                />
                {!user?.phone_confirmed && (
                  <Button variant="outlined" size="small" startIcon={<PhoneIcon />}>
                    Confirm Phone
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default Profile;
