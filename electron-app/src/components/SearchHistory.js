import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Paper,
  Divider,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Domain as DomainIcon,
  PhoneAndroid as PhoneIcon,
  Email as EmailIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

const SearchHistory = () => {
  const { getSearchHistory, deleteSearchHistory, loading, error } = useApp();
  
  const [searchHistory, setSearchHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  const searchTypes = [
    { value: 'all', label: 'All Searches', icon: <SearchIcon /> },
    { value: 'people', label: 'People Search', icon: <PersonIcon /> },
    { value: 'reverse', label: 'Reverse Lookup', icon: <PhoneIcon /> },
    { value: 'social', label: 'Social Intelligence', icon: <EmailIcon /> },
    { value: 'domain', label: 'Domain Intelligence', icon: <DomainIcon /> },
  ];

  const dateFilters = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  useEffect(() => {
    loadSearchHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchHistory, filterType, searchFilter, dateFilter]);

  const loadSearchHistory = async () => {
    try {
      const history = await getSearchHistory();
      setSearchHistory(history || []);
    } catch (err) {
      console.error('Failed to load search history:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...searchHistory];

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.search_type === filterType);
    }

    // Apply search filter
    if (searchFilter.trim()) {
      const searchTerm = searchFilter.toLowerCase();
      filtered = filtered.filter(item => 
        item.query.toLowerCase().includes(searchTerm) ||
        item.search_type.toLowerCase().includes(searchTerm) ||
        (item.results_summary && item.results_summary.toLowerCase().includes(searchTerm))
      );
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(item => 
          new Date(item.timestamp) >= filterDate
        );
      }
    }

    setFilteredHistory(filtered);
  };

  const handleDeleteSearch = async (searchId) => {
    try {
      await deleteSearchHistory(searchId);
      setSearchHistory(prev => prev.filter(item => item.id !== searchId));
    } catch (err) {
      console.error('Failed to delete search:', err);
    }
  };

  const getSearchTypeIcon = (type) => {
    const typeData = searchTypes.find(t => t.value === type);
    return typeData ? typeData.icon : <SearchIcon />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today, ' + date.toLocaleTimeString();
    } else if (diffDays <= 7) {
      return diffDays + ' days ago';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Mock data for demonstration
  const mockHistory = [
    {
      id: '1',
      search_type: 'people',
      query: 'John Doe',
      timestamp: new Date().toISOString(),
      status: 'completed',
      results_count: 15,
      results_summary: 'Found 15 profiles across 8 platforms',
    },
    {
      id: '2',
      search_type: 'reverse',
      query: '+1-555-123-4567',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed',
      results_count: 3,
      results_summary: 'Found owner information and associated accounts',
    },
    {
      id: '3',
      search_type: 'domain',
      query: 'example.com',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      status: 'completed',
      results_count: 25,
      results_summary: 'Domain analysis with 25 subdomains discovered',
    },
    {
      id: '4',
      search_type: 'social',
      query: '@username123',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      status: 'failed',
      results_count: 0,
      results_summary: 'Search failed due to rate limiting',
    },
  ];

  // Use mock data if no real history
  const displayHistory = searchHistory.length > 0 ? filteredHistory : mockHistory.filter(item => {
    if (filterType !== 'all' && item.search_type !== filterType) return false;
    if (searchFilter.trim() && !item.query.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom color="primary">
            Search History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your investigation history
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadSearchHistory}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'An error occurred'}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search history..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Search Type</InputLabel>
                <Select
                  value={filterType}
                  label="Search Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  {searchTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={dateFilter}
                  label="Time Period"
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  {dateFilters.map((filter) => (
                    <MenuItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* History List */}
      <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Search History ({displayHistory.length})
          </Typography>
          
          {displayHistory.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Search History Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your investigation history will appear here after you perform searches
              </Typography>
            </Paper>
          ) : (
            <List>
              {displayHistory.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ListItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      {getSearchTypeIcon(item.search_type)}
                    </Box>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{item.query}</Typography>
                          <Chip 
                            label={item.search_type} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            label={item.status} 
                            size="small" 
                            color={getStatusColor(item.status)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {item.results_summary}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(item.timestamp)} • 
                            {item.results_count} results
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteSearch(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < displayHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SearchHistory;