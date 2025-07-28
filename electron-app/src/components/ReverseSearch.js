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
} from '@mui/material';
import {
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as AddressIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

const ReverseSearch = () => {
  const { performReverseSearch, loading, error } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('phone');
  const [results, setResults] = useState(null);

  const searchTypes = [
    { value: 'phone', label: 'Phone Number', icon: <PhoneIcon /> },
    { value: 'email', label: 'Email Address', icon: <EmailIcon /> },
    { value: 'address', label: 'Physical Address', icon: <AddressIcon /> },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const searchData = {
        query_type: 'reverse',
        [searchType]: searchQuery,
        advanced_options: {
          deep_search: true,
          correlate_data: true
        }
      };

      const response = await performReverseSearch(searchData);
      setResults(response);
    } catch (err) {
      console.error('Reverse search failed:', err);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setResults(null);
  };

  const getPlaceholderText = () => {
    switch (searchType) {
      case 'phone':
        return 'Enter phone number (e.g., +1-555-123-4567)';
      case 'email':
        return 'Enter email address (e.g., user@example.com)';
      case 'address':
        return 'Enter address (e.g., 123 Main St, City, State)';
      default:
        return 'Enter search query';
    }
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <Card sx={{ mt: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Reverse Search Results
          </Typography>
          
          {results.results && Object.keys(results.results).length > 0 ? (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Confidence Score: {results.confidence_score || 0}%
                </Typography>
                <Chip 
                  label={`${results.sources_checked?.length || 0} sources checked`}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
              
              <List>
                {Object.entries(results.results).map(([source, data], index) => (
                  <React.Fragment key={source}>
                    <ListItem>
                      <ListItemText
                        primary={source}
                        secondary={
                          <Box>
                            {typeof data === 'object' ? (
                              Object.entries(data).map(([key, value]) => (
                                <Typography key={key} variant="body2" component="div">
                                  <strong>{key}:</strong> {String(value)}
                                </Typography>
                              ))
                            ) : (
                              <Typography variant="body2">{String(data)}</Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < Object.keys(results.results).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          ) : (
            <Alert severity="info">
              No results found for this search query.
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom color="primary">
        Reverse Search
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Perform reverse lookups on phone numbers, email addresses, and physical addresses
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
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

      {renderResults()}
    </Box>
  );
};

export default ReverseSearch;