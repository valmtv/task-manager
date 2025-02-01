import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  Divider,
  Avatar,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

function Profile({ user }) {
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>
            <PersonIcon />
          </Avatar>
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
            value={user?.name || ''}
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
            value={user?.email || ''}
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
            value={user?.role || ''}
            InputProps={{
              readOnly: true,
            }}
            margin="normal"
          />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box display="flex" justifyContent="space-between">
          <Button variant="outlined" color="secondary">
            Change Password
          </Button>
          <Button variant="contained" color="primary">
            Update Profile
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Profile;
