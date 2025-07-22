import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Chip,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon,
  Download as ExportIcon,
  Clear as ClearIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

const Header = ({ onMenuToggle }) => {
  const theme = useTheme();
  const {
    session,
    searchResults,
    toolsStatus,
    notifications,
    exportSearchHistory,
    clearSearchHistory,
  } = useApp();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const getActiveToolsCount = () => {
    return Object.values(toolsStatus).filter(status => status === 'running').length;
  };

  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.read).length;
  };

  return (
    <AppBar position="fixed" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #00d4ff 0%, #ff6b35 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0px 2px 4px rgba(0, 212, 255, 0.3)',
            }}
          >
            InfoScape
          </Typography>
          
          <Chip
            label={`v2.0.0`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* Center Section - Session Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {session.id && (
            <Tooltip title={`Session: ${session.id}`}>
              <Chip
                icon={<InfoIcon />}
                label={`${searchResults.length} searches`}
                size="small"
                variant="filled"
                sx={{ 
                  backgroundColor: 'rgba(0, 212, 255, 0.2)',
                  color: theme.palette.primary.main,
                }}
              />
            </Tooltip>
          )}
          
          {getActiveToolsCount() > 0 && (
            <Tooltip title={`${getActiveToolsCount()} tools running`}>
              <Chip
                icon={<SearchIcon />}
                label={`${getActiveToolsCount()} active`}
                size="small"
                color="warning"
                variant="filled"
                sx={{ 
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.7 },
                    '100%': { opacity: 1 },
                  },
                }}
              />
            </Tooltip>
          )}
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Export Button */}
          <Tooltip title="Export Search History">
            <IconButton
              color="inherit"
              onClick={exportSearchHistory}
              disabled={searchResults.length === 0}
            >
              <ExportIcon />
            </IconButton>
          </Tooltip>

          {/* Clear History Button */}
          <Tooltip title="Clear Search History">
            <IconButton
              color="inherit"
              onClick={clearSearchHistory}
              disabled={searchResults.length === 0}
            >
              <ClearIcon />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleNotificationOpen}
            >
              <NotificationsIcon />
              {getUnreadNotifications() > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 8,
                    height: 8,
                    backgroundColor: theme.palette.error.main,
                    borderRadius: '50%',
                  }}
                />
              )}
            </IconButton>
          </Tooltip>

          {/* Settings Menu */}
          <Tooltip title="Settings">
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          {/* User Avatar */}
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: theme.palette.primary.main,
              cursor: 'pointer',
            }}
            onClick={handleMenuOpen}
          >
            <AccountIcon />
          </Avatar>
        </Box>

        {/* Settings Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
            },
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <SettingsIcon sx={{ mr: 1 }} />
            Preferences
          </MenuItem>
          <MenuItem onClick={() => {
            exportSearchHistory();
            handleMenuClose();
          }}>
            <ExportIcon sx={{ mr: 1 }} />
            Export Data
          </MenuItem>
          <MenuItem onClick={() => {
            clearSearchHistory();
            handleMenuClose();
          }}>
            <ClearIcon sx={{ mr: 1 }} />
            Clear History
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1,
              maxWidth: 400,
              maxHeight: 400,
            },
          }}
        >
          {notifications.length === 0 ? (
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </MenuItem>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <MenuItem key={notification.id} onClick={handleNotificationClose}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
          {notifications.length > 5 && (
            <MenuItem onClick={handleNotificationClose}>
              <Typography variant="caption" color="primary">
                +{notifications.length - 5} more notifications
              </Typography>
            </MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
