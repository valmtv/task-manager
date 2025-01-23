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
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <ListItem key={notification.id}>
              <ListItemText
                primary={notification.message}
                secondary={`Type: ${notification.type} - ${
                  notification.is_read ? 'Read' : 'Unread'
                }`}
              />
              {!notification.is_read && (
                <Button onClick={() => markAsRead(notification.id)} color="primary">
                  Mark as Read
                </Button>
              )}
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => deleteNotification(notification.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))
        ) : (
          <Typography variant="body1">No notifications to display.</Typography>
        )}
      </List>
    </div>
  );
}

export default Notifications;

