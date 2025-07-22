import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Button,
  Tooltip,
  Divider,
  Container,
  useTheme,
  alpha,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Public as DomainIcon,
  Share as SocialIcon,
  SwapHoriz as ReverseIcon,
  Assessment as ReportIcon,
  Schedule as RecentIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Shield as ShieldIcon,
  Visibility as VisibilityIcon,
  DataUsage as DataIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

const Dashboard = ({ onViewChange }) => {
  const theme = useTheme();
  const { 
    searchResults, 
    session, 
    toolsStatus, 
    checkToolsStatus,
    loading 
  } = useApp();

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Update recent activity when search results change
    const recent = searchResults
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
    setRecentActivity(recent);
  }, [searchResults]);

  const features = [
    {
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      title: 'People Intelligence',
      description: 'Advanced person lookup across multiple platforms and databases',
      action: () => onViewChange('people-search'),
      color: theme.palette.primary.main,
    },
    {
      icon: <SocialIcon sx={{ fontSize: 40 }} />,
      title: 'Social Media Analysis',
      description: 'Comprehensive social media presence investigation',
      action: () => onViewChange('social-intel'),
      color: theme.palette.secondary.main,
    },
    {
      icon: <DomainIcon sx={{ fontSize: 40 }} />,
      title: 'Domain Intelligence',
      description: 'Domain and infrastructure reconnaissance',
      action: () => onViewChange('domain-intel'),
      color: theme.palette.success.main,
    },
    {
      icon: <ReverseIcon sx={{ fontSize: 40 }} />,
      title: 'Reverse Lookup',
      description: 'Reverse search by email, phone, or other identifiers',
      action: () => onViewChange('reverse-search'),
      color: theme.palette.warning.main,
    },
  ];

  const capabilities = [
    { icon: <SecurityIcon />, text: 'Advanced OSINT Capabilities' },
    { icon: <AnalyticsIcon />, text: 'Real-time Data Analytics' },
    { icon: <SpeedIcon />, text: 'High-Speed Processing' },
    { icon: <ShieldIcon />, text: 'Secure & Anonymous' },
    { icon: <VisibilityIcon />, text: 'Comprehensive Coverage' },
    { icon: <DataIcon />, text: 'Multi-Source Aggregation' },
  ];

  const stats = [
    { label: 'Active Tools', value: '12+', icon: <SecurityIcon /> },
    { label: 'Data Sources', value: '50+', icon: <DataIcon /> },
    { label: 'Search Types', value: '8', icon: <SearchIcon /> },
    { label: 'Success Rate', value: '99.5%', icon: <CheckIcon /> },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          borderRadius: 4,
          p: 6,
          mb: 6,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            mb: 2,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '2.5rem', md: '3.5rem' },
          }}
        >
          InfoScape
        </Typography>
        <Typography
          variant="h5"
          sx={{
            mb: 4,
            color: 'text.secondary',
            fontWeight: 300,
            fontSize: { xs: '1.2rem', md: '1.5rem' },
          }}
        >
          Advanced OSINT Intelligence Platform
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: 'text.secondary',
            maxWidth: 600,
            mx: 'auto',
            fontSize: '1.1rem',
            lineHeight: 1.6,
          }}
        >
          Harness the power of next-generation open source intelligence gathering.
          Aggregate data from multiple sources, analyze patterns, and uncover insights
          with unparalleled accuracy and speed.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => onViewChange('people-search')}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 3,
            textTransform: 'none',
            fontSize: '1.1rem',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            '&:hover': {
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
            },
          }}
        >
          Start Your Investigation
        </Button>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            mb: 4,
            fontWeight: 600,
          }}
        >
          Intelligence Capabilities
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: `linear-gradient(135deg, ${alpha(feature.color, 0.1)}, ${alpha(feature.color, 0.05)})`,
                  border: `1px solid ${alpha(feature.color, 0.2)}`,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 24px ${alpha(feature.color, 0.3)}`,
                    border: `1px solid ${alpha(feature.color, 0.4)}`,
                  },
                }}
                onClick={feature.action}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    sx={{
                      color: feature.color,
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    size="small"
                    sx={{
                      color: feature.color,
                      '&:hover': {
                        backgroundColor: alpha(feature.color, 0.1),
                      },
                    }}
                  >
                    Explore
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {stats.map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ color: theme.palette.primary.main, mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Capabilities Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            mb: 4,
            fontWeight: 600,
          }}
        >
          Platform Capabilities
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                  Advanced Features
                </Typography>
                <List>
                  {capabilities.map((capability, index) => (
                    <ListItem key={index} sx={{ py: 1 }}>
                      <ListItemIcon sx={{ color: theme.palette.success.main, minWidth: 40 }}>
                        {capability.icon}
                      </ListItemIcon>
                      <ListItemText primary={capability.text} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                  Tool Status
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1">System Health</Typography>
                  <Chip
                    label="Operational"
                    color="success"
                    size="small"
                    icon={<CheckIcon />}
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    OSINT Tools Availability
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={95}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.info.main, 0.2),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.success.main,
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    95% of tools are online and ready
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  onClick={checkToolsStatus}
                  disabled={loading}
                  startIcon={<RefreshIcon />}
                  sx={{
                    borderColor: alpha(theme.palette.info.main, 0.5),
                    color: theme.palette.info.main,
                    '&:hover': {
                      borderColor: theme.palette.info.main,
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                    },
                  }}
                >
                  Refresh Status
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
