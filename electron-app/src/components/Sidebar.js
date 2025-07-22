import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Typography,
  Box,
  Chip,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Public as DomainIcon,
  Share as SocialIcon,
  SwapHoriz as ReverseIcon,
  Assessment as ReportsIcon,
  Build as ToolsIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  ExpandLess,
  ExpandMore,
  CheckCircle as OnlineIcon,
  Error as ErrorIcon,
  Schedule as RunningIcon,
  Help as UnknownIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

const drawerWidth = 280;

const Sidebar = ({ open, onToggle, currentView, onViewChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { toolsStatus, searchResults } = useApp();
  
  const [toolsExpanded, setToolsExpanded] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
      case 'completed':
        return <OnlineIcon sx={{ color: theme.palette.success.main, fontSize: 16 }} />;
      case 'running':
        return <RunningIcon sx={{ color: theme.palette.warning.main, fontSize: 16 }} />;
      case 'error':
      case 'offline':
        return <ErrorIcon sx={{ color: theme.palette.error.main, fontSize: 16 }} />;
      default:
        return <UnknownIcon sx={{ color: theme.palette.text.disabled, fontSize: 16 }} />;
    }
  };

  const getSearchCount = (type) => {
    return searchResults.filter(result => result.type === type).length;
  };

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      count: null,
    },
    {
      id: 'people-search',
      label: 'People Search',
      icon: <PersonIcon />,
      count: getSearchCount('people'),
    },
    {
      id: 'reverse-search',
      label: 'Reverse Lookup',
      icon: <ReverseIcon />,
      count: getSearchCount('reverse'),
    },
    {
      id: 'social-intel',
      label: 'Social Intelligence',
      icon: <SocialIcon />,
      count: getSearchCount('social'),
    },
    {
      id: 'domain-intel',
      label: 'Domain Intelligence',
      icon: <DomainIcon />,
      count: getSearchCount('domain'),
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <ReportsIcon />,
      count: null,
    },
    {
      id: 'history',
      label: 'Search History',
      icon: <HistoryIcon />,
      count: searchResults.length,
    },
  ];

  const toolItems = [
    { name: 'sherlock', label: 'Sherlock' },
    { name: 'maigret', label: 'Maigret' },
    { name: 'socialscan', label: 'SocialScan' },
    { name: 'holehe', label: 'Holehe' },
    { name: 'theharvester', label: 'TheHarvester' },
    { name: 'photon', label: 'Photon' },
    { name: 'sublist3r', label: 'Sublist3r' },
    { name: 'amass', label: 'Amass' },
    { name: 'nmap', label: 'Nmap' },
    { name: 'nuclei', label: 'Nuclei' },
  ];

  const handleNavigation = (viewId) => {
    onViewChange(viewId);
    if (isMobile) {
      onToggle(); // Close sidebar on mobile after navigation
    }
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      anchor="left"
      open={open}
      onClose={isMobile ? onToggle : undefined}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          mt: isMobile ? 0 : '64px',
          height: isMobile ? '100vh' : 'calc(100vh - 64px)',
          zIndex: isMobile ? theme.zIndex.drawer + 1 : 'auto',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 600,
            textAlign: 'center',
            mb: 2,
          }}
        >
          Navigation
        </Typography>
      </Box>

      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={currentView === item.id}
              onClick={() => handleNavigation(item.id)}
              sx={{
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0, 212, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 212, 255, 0.3)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: currentView === item.id ? 600 : 400,
                }}
              />
              {item.count !== null && item.count > 0 && (
                <Chip
                  label={item.count}
                  size="small"
                  color="primary"
                  variant="filled"
                  sx={{
                    minWidth: 20,
                    height: 20,
                    fontSize: '0.7rem',
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Tools Section */}
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => setToolsExpanded(!toolsExpanded)}
            sx={{
              mx: 1,
              borderRadius: 2,
            }}
          >
            <ListItemIcon>
              <ToolsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="OSINT Tools"
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: 600,
                color: theme.palette.text.secondary,
              }}
            />
            {toolsExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={toolsExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {toolItems.map((tool) => (
              <ListItem key={tool.name} disablePadding>
                <ListItemButton
                  sx={{
                    pl: 4,
                    mx: 1,
                    borderRadius: 2,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {getStatusIcon(toolsStatus[tool.name])}
                  </ListItemIcon>
                  <ListItemText
                    primary={tool.label}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontSize: '0.8rem',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Settings */}
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={currentView === 'settings'}
            onClick={() => handleNavigation('settings')}
            sx={{
              mx: 1,
              borderRadius: 2,
              '&.Mui-selected': {
                backgroundColor: 'rgba(0, 212, 255, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 212, 255, 0.3)',
                },
              },
            }}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Settings"
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: currentView === 'settings' ? 600 : 400,
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Footer */}
      <Box
        sx={{
          mt: 'auto',
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center' }}
        >
          InfoScape v2.0.0
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center' }}
        >
          Advanced OSINT Toolkit
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
