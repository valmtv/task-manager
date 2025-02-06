import React, { useState, useEffect } from 'react';
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
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LockResetIcon from '@mui/icons-material/LockReset';
import api from '../api/api';

function Profile({ initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState('');
  const [originalValue, setOriginalValue] = useState('');

  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailVerificationError, setEmailVerificationError] = useState('');

  const [passwordResetCode, setPasswordResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/users/user');
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    };

    fetchUserData();
  }, []);

  const startEditing = (field, value) => {
    setEditingField(field);
    setEditedValue(value);
    setOriginalValue(value);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditedValue(originalValue);
  };

  const saveChanges = (field) => {
    console.log(`Saving changes for ${field}:`, editedValue);
    setEditingField(null);
  };

  const handleSendVerificationCode = async () => {
    try {
      await api.post('/verify-email/send-code', { email: user.email });
      setIsVerifyingEmail(true);
      setEmailVerificationError('');
    } catch (err) {
      setEmailVerificationError(err.response?.data?.message || 'Failed to send verification code');
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await api.post('/verify-email/confirm', { email: user.email, code: emailVerificationCode });
      setIsVerifyingEmail(false);
      setEmailVerificationCode('');
      setEmailVerificationError('');

      setUser({ ...user, email_confirmed: true });

      alert('Email verified successfully!');
    } catch (err) {
      setEmailVerificationError(err.response?.data?.message || 'Failed to verify email');
    }
  };

  const handleSendPasswordResetCode = async () => {
    try {
      await api.post('/reset-password/send-code', { email: user.email });
      setIsResettingPassword(true);
      setPasswordResetError('');
    } catch (err) {
      setPasswordResetError(err.response?.data?.message || 'Failed to send password reset code');
    }
  };

  const handleResetPassword = async () => {
    try {
      await api.post('/reset-password/confirm', { email: user.email, code: passwordResetCode, newPassword });
      setPasswordResetCode('');
      setNewPassword('');
      setIsResettingPassword(false);
      setPasswordResetError('');
      alert('Password reset successfully!');
    } catch (err) {
      setPasswordResetError(err.response?.data?.message || 'Failed to reset password');
    }
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
            {[{ label: 'Name', key: 'name' }, { label: 'Email', key: 'email' }, { label: 'Phone Number', key: 'phone_number' }].map((field) => (
              <Grid item xs={12} key={field.key}>
                <Box display="flex" alignItems="center">
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>{field.label}:</Typography>
                  {editingField === field.key ? (
                    <Box display="flex" alignItems="center">
                      <TextField
                        size="small"
                        value={editedValue}
                        onChange={(e) => setEditedValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveChanges(field.key);
                          if (e.key === 'Escape') cancelEditing();
                        }}
                        autoFocus
                      />
                      <IconButton onClick={() => saveChanges(field.key)}>
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={cancelEditing}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box display="flex" alignItems="center">
                      <Typography variant="body1" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        {user?.[field.key] || 'Not Set'}
                      </Typography>
                      <Tooltip title={`Edit ${field.label}`}>
                        <IconButton onClick={() => startEditing(field.key, user?.[field.key] || '')}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Security Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {/* Email Confirmation */}
          <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>Email Confirmation:</Typography>
            <Chip
              label={user?.email_confirmed ? 'Confirmed' : 'Not Confirmed'}
              size="small"
              color={user?.email_confirmed ? 'success' : 'warning'}
              sx={{ mr: 2 }}
            />
            {!user?.email_confirmed && (
              <>
                {!isVerifyingEmail ? (
                  <Button variant="outlined" size="small" startIcon={<EmailIcon />} onClick={handleSendVerificationCode}>
                    Send Verification Code
                  </Button>
                ) : (
                  <Box display="flex" alignItems="center">
                    <TextField
                      size="small"
                      placeholder="Enter code"
                      value={emailVerificationCode}
                      onChange={(e) => setEmailVerificationCode(e.target.value)}
                      sx={{ mr: 2 }}
                    />
                    <Button variant="contained" size="small" onClick={handleVerifyEmail}>
                      Verify
                    </Button>
                  </Box>
                )}
                {emailVerificationError && <Alert severity="error">{emailVerificationError}</Alert>}
              </>
            )}
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>Phone Confirmation:</Typography>
            <Chip
              label={user?.phone_confirmed ? 'Confirmed' : 'Not Confirmed'}
              size="small"
              color={user?.phone_confirmed ? 'success' : 'warning'}
              sx={{ mr: 2 }}
            />
            {!user?.phone_confirmed && (
              <Button variant="outlined" size="small" startIcon={<PhoneIcon />} disabled>
                Confirm Phone
              </Button>
            )}
          </Grid>

          {/* Password Reset */}
          <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>Reset Password:</Typography>
            {user?.email_confirmed ? (
              !isResettingPassword ? (
                <Button variant="outlined" size="small" startIcon={<LockResetIcon />} onClick={handleSendPasswordResetCode}>
                  Send Reset Code
                </Button>
              ) : (
                <Box display="flex" alignItems="center">
                  <TextField
                    size="small"
                    placeholder="Enter code"
                    value={passwordResetCode}
                    onChange={(e) => setPasswordResetCode(e.target.value)}
                    sx={{ mr: 2 }}
                  />
                  <TextField
                    size="small"
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    sx={{ mr: 2 }}
                  />
                  <Button variant="contained" size="small" onClick={handleResetPassword}>
                    Reset
                  </Button>
                </Box>
              )
            ) : (
              <Typography variant="caption" color="textSecondary">
                Verify your email to reset your password.
              </Typography>
            )}
            {passwordResetError && <Alert severity="error">{passwordResetError}</Alert>}
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default Profile;