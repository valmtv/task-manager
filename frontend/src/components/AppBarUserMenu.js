import React, { useState, useRef } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

function AppBarUserMenu({ user, handleLogout, navigate }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const menuRef = useRef(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };


  return (
    <div
      onMouseEnter={handleMenuOpen}
      onMouseLeave={handleMenuClose}
      style={{ display: 'inline-block', cursor: 'pointer' }}
      ref={menuRef}
    >
      <Button
        color="inherit"
        startIcon={<Avatar><PersonIcon /></Avatar>}
      >
        {user.name || 'User'}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onMouseLeave={handleMenuClose}
        PaperProps={{
          onMouseLeave: handleMenuClose, 
        }}
      >
        <MenuItem disabled>
          <Typography variant="body2" color="textSecondary">
            {user.email}
          </Typography>
        </MenuItem>
        <MenuItem disabled>
          <Typography variant="body2" color="textSecondary">
            Role: {user.role}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            navigate('/profile');
            handleMenuClose();
          }}
        >
          Profile Settings
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleLogout();
            handleMenuClose();
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </div>
  );
}

export default AppBarUserMenu;
