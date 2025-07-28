import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  Divider,
  Avatar,
  Link,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

const SocialIntelligence = () => {
  const { performSocialIntelligence, loading, error } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('username');
  const [results, setResults] = useState(null);

  const searchTypes = [
    { value: 'username', label: 'Username' },
    { value: 'email', label: 'Email Address' },
    { value: 'name', label: 'Full Name' },
    { value: 'phone', label: 'Phone Number' },
  ];

  const socialPlatforms = [
    { name: 'Facebook', icon: <FacebookIcon />, color: '#1877F2' },
    { name: 'Twitter', icon: <TwitterIcon />, color: '#1DA1F2' },
    { name: 'Instagram', icon: <InstagramIcon />, color: '#E4405F' },
    { name: 'LinkedIn', icon: <LinkedInIcon />, color: '#0A66C2' },
    { name: 'TikTok', icon: <PersonIcon />, color: '#000000' },
    { name: 'YouTube', icon: <PersonIcon />, color: '#FF0000' },
    { name: 'Snapchat', icon: <PersonIcon />, color: '#FFFC00' },
    { name: 'Pinterest', icon: <PersonIcon />, color: '#BD081C' },
    { name: 'Reddit', icon: <PersonIcon />, color: '#FF4500' },
    { name: 'Discord', icon: <PersonIcon />, color: '#5865F2' },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const searchData = {
        query_type: 'social_intel',
        [searchType]: searchQuery,
        advanced_options: {
          deep_search: true,
          profile_analysis: true,
          relationship_mapping: true,
          behavioral_analysis: true
        }
      };

      const response = await performSocialIntelligence(searchData);
      setResults(response);
    } catch (err) {
      console.error('Social intelligence search failed:', err);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setResults(null);
  };

  const getPlaceholderText = () => {
    switch (searchType) {
      case 'username':
        return 'Enter username (e.g., johndoe123)';
      case 'email':
        return 'Enter email address (e.g., user@example.com)';
      case 'name':
        return 'Enter full name (e.g., John Doe)';
      case 'phone':
        return 'Enter phone number';
      default:
        return 'Enter search query';
    }
  };

  const renderSocialProfiles = () => {
    if (!results?.social_profiles) return null;

    return (
      <Card sx={{ mt: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Social Media Profiles Found
          </Typography>
          
          <Grid container spacing={2}>
            {results.social_profiles.map((profile, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        backgroundColor: profile.platform_color || '#666',
                        mr: 2 
                      }}
                    >
                      {profile.platform_icon || <PersonIcon />}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{profile.platform}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Confidence: {profile.confidence}%
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      <strong>Username:</strong> {profile.username}
                    </Typography>
                    {profile.display_name && (
                      <Typography variant="body2" gutterBottom>
                        <strong>Display Name:</strong> {profile.display_name}
                      </Typography>
                    )}
                    {profile.profile_url && (
                      <Link 
                        href={profile.profile_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        sx={{ color: 'primary.main' }}
                      >
                        View Profile
                      </Link>
                    )}
                    {profile.bio && (
                      <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                        {profile.bio}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderAnalytics = () => {
    if (!results?.analytics) return null;

    return (
      <Card sx={{ mt: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Social Intelligence Analytics
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {results.analytics.total_profiles || 0}
                </Typography>
                <Typography variant="body2">Profiles Found</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                <PersonIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" color="success.main">
                  {results.analytics.high_confidence || 0}
                </Typography>
                <Typography variant="body2">High Confidence</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                <SearchIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" color="warning.main">
                  {results.analytics.platforms_searched || 0}
                </Typography>
                <Typography variant="body2">Platforms Searched</Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderScanningProgress = () => {
    if (!loading) return null;

    return (
      <Card sx={{ mt: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Scanning Social Media Platforms
          </Typography>
          
          <Grid container spacing={1}>
            {socialPlatforms.map((platform, index) => (
              <Grid item xs={6} sm={4} md={3} key={platform.name}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 1,
                    border: `1px solid ${platform.color}20`
                  }}
                >
                  <Box sx={{ color: platform.color, mr: 1 }}>
                    {platform.icon}
                  </Box>
                  <Typography variant="body2">{platform.name}</Typography>
                  <CircularProgress size={16} sx={{ ml: 'auto' }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom color="primary">
        Social Media Intelligence
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Comprehensive social media profile discovery and analysis across multiple platforms
      </Typography>

      <Card sx={{ mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Search Type</InputLabel>
                <Select
                  value={searchType}
                  label="Search Type"
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  {searchTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search Query"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={getPlaceholderText()}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1, height: '100%' }}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading || !searchQuery.trim()}
                  startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                  sx={{ flex: 1 }}
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClear}
                  disabled={loading}
                  startIcon={<ClearIcon />}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'An error occurred during the search'}
        </Alert>
      )}

      {renderScanningProgress()}
      {renderAnalytics()}
      {renderSocialProfiles()}
    </Box>
  );
};

export default SocialIntelligence;