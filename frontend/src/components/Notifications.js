import React, { useContext } from 'react';
import { List, ListItem, ListItemText, Typography, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationContext from '../contexts/NotificationContext';

function Notifications() {
  const { notifications, markAsRead, deleteNotification } = useContext(NotificationContext);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>
      <List>
        {notifications.map((notification) => (
          <ListItem key={notification.id}>
            <ListItemText
              primary={notification.message}
              secondary={`Type: ${notification.type}`}
            />
            {!notification.isRead && (
              <Button onClick={() => markAsRead(notification.id)}>Mark as Read</Button>
            )}
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => deleteNotification(notification.id)}
            >
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default Notifications;
