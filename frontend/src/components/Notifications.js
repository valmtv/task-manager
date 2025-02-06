import React, { useContext, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Grid,
  Collapse,
} from '@mui/material';
import { CheckCircle, Warning, Error, Info, Delete } from '@mui/icons-material';
import NotificationContext from '../contexts/NotificationContext';

function Notifications() {
  const { notifications, markAsRead, deleteNotification } = useContext(NotificationContext);

  const [expandedNotifications, setExpandedNotifications] = useState(new Set());

  const toggleExpansion = (id) => {
    const newExpandedNotifications = new Set(expandedNotifications);
    if (newExpandedNotifications.has(id)) {
      newExpandedNotifications.delete(id);
    } else {
      newExpandedNotifications.add(id);
    }
    setExpandedNotifications(newExpandedNotifications);
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'Info':
        return <Info color="info" />;
      case 'Warning':
        return <Warning color="warning" />;
      case 'Error':
        return <Error color="error" />;
      case 'Success':
        return <CheckCircle color="success" />;
      default:
        return null;
    }
  };

  return (
    <Box padding={3}>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>

      {notifications.length === 0 && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="textSecondary">
            No notifications to display.
          </Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {notifications.map((notification) => {
          const isExpandable = notification.message.length > 50;

          return (
            <Grid item xs={12} key={notification.id}>
              <Card
                elevation={3}
                onClick={isExpandable ? () => toggleExpansion(notification.id) : undefined}
                sx={{
                  cursor: isExpandable ? 'pointer' : 'default',
                  backgroundColor: notification.is_read ? '#f9f9f9' : '#ffffff',
                  transition: 'background-color 0.3s',
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  p={2}
                >
                  <Box display="flex" alignItems="center">
                    {getIconForType(notification.type)}
                    <Typography variant="body2" color="textSecondary" ml={1}>
                      {notification.type} - {notification.is_read ? 'Read' : 'Unread'}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center">
                    {!notification.is_read && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        sx={{
                          bgcolor: '#1976d2',
                          '&:hover': { bgcolor: '#1565c0' },
                          mr: 1,
                        }}
                      >
                        Mark as Read
                      </Button>
                    )}
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      sx={{ color: '#d32f2f' }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
                <CardContent sx={{ paddingTop: 0 }}>
                  {!expandedNotifications.has(notification.id) && (
                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {notification.message.slice(0, 50)}{' '}
                      {isExpandable && '...'}
                    </Typography>
                  )}

                  {isExpandable && (
                    <Collapse in={expandedNotifications.has(notification.id)} timeout="auto">
                      <Typography
                        variant="body1"
                        mt={1}
                        sx={{
                          wordWrap: 'break-word',
                          whiteSpace: 'normal',
                        }}
                      >
                        {notification.message}
                      </Typography>
                    </Collapse>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default Notifications;
