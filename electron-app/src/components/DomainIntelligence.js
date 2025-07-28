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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Search as SearchIcon,
  Domain as DomainIcon,
  Security as SecurityIcon,
  LocationOn as LocationIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

const DomainIntelligence = () => {
  const { performDomainIntelligence, loading, error } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('domain');
  const [results, setResults] = useState(null);

  const searchTypes = [
    { value: 'domain', label: 'Domain Name' },
    { value: 'ip', label: 'IP Address' },
    { value: 'subdomain', label: 'Subdomain Discovery' },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const searchData = {
        query_type: 'domain_intel',
        [searchType]: searchQuery,
        advanced_options: {
          subdomain_enumeration: true,
          security_scan: true,
          historical_data: true,
          dns_analysis: true,
          whois_lookup: true
        }
      };

      const response = await performDomainIntelligence(searchData);
      setResults(response);
    } catch (err) {
      console.error('Domain intelligence search failed:', err);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setResults(null);
  };

  const getPlaceholderText = () => {
    switch (searchType) {
      case 'domain':
        return 'Enter domain name (e.g., example.com)';
      case 'ip':
        return 'Enter IP address (e.g., 192.168.1.1)';
      case 'subdomain':
        return 'Enter domain for subdomain discovery';
      default:
        return 'Enter search query';
    }
  };

  const renderDomainInfo = () => {
    if (!results?.domain_info) return null;

    const info = results.domain_info;
    
    return (
      <Card sx={{ mt: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Domain Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DomainIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Basic Information</Typography>
                </Box>
                
                <List dense>
                  <ListItem>
                    <ListItemText primary="Domain" secondary={info.domain || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Registrar" secondary={info.registrar || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Creation Date" secondary={info.creation_date || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Expiration Date" secondary={info.expiration_date || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Status" secondary={
                      <Chip 
                        label={info.status || 'Unknown'} 
                        color={info.status === 'Active' ? 'success' : 'default'}
                        size="small"
                      />
                    } />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Location & Network</Typography>
                </Box>
                
                <List dense>
                  <ListItem>
                    <ListItemText primary="IP Address" secondary={info.ip_address || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Country" secondary={info.country || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Organization" secondary={info.organization || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="ISP" secondary={info.isp || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="ASN" secondary={info.asn || 'N/A'} />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderDNSRecords = () => {
    if (!results?.dns_records) return null;

    return (
      <Accordion sx={{ mt: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">DNS Records</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>TTL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(results.dns_records).map(([type, records]) => 
                  Array.isArray(records) ? records.map((record, index) => (
                    <TableRow key={`${type}-${index}`}>
                      <TableCell>
                        <Chip label={type} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{record.value || record}</TableCell>
                      <TableCell>{record.ttl || 'N/A'}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow key={type}>
                      <TableCell>
                        <Chip label={type} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{records}</TableCell>
                      <TableCell>N/A</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderSubdomains = () => {
    if (!results?.subdomains || results.subdomains.length === 0) return null;

    return (
      <Accordion sx={{ mt: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Subdomains ({results.subdomains.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1}>
            {results.subdomains.map((subdomain, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper sx={{ p: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                  <Typography variant="body2" noWrap>
                    {subdomain}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderSecurityScan = () => {
    if (!results?.security_scan) return null;

    const security = results.security_scan;
    
    return (
      <Accordion sx={{ mt: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Security Analysis</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" color="success.main">
                  {security.ssl_valid ? 'Valid' : 'Invalid'}
                </Typography>
                <Typography variant="body2">SSL Certificate</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                <SecurityIcon sx={{ 
                  fontSize: 40, 
                  color: security.security_headers > 5 ? 'success.main' : 'warning.main', 
                  mb: 1 
                }} />
                <Typography variant="h6" color={security.security_headers > 5 ? 'success.main' : 'warning.main'}>
                  {security.security_headers || 0}
                </Typography>
                <Typography variant="body2">Security Headers</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                <WarningIcon sx={{ 
                  fontSize: 40, 
                  color: security.vulnerabilities > 0 ? 'error.main' : 'success.main', 
                  mb: 1 
                }} />
                <Typography variant="h6" color={security.vulnerabilities > 0 ? 'error.main' : 'success.main'}>
                  {security.vulnerabilities || 0}
                </Typography>
                <Typography variant="body2">Vulnerabilities</Typography>
              </Paper>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom color="primary">
        Domain & IP Intelligence
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Comprehensive domain analysis, security scanning, and reconnaissance
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
                label="Target"
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
                  Analyze
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
          {error.message || 'An error occurred during the analysis'}
        </Alert>
      )}

      {loading && (
        <Card sx={{ mt: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ mr: 2 }} />
              <Typography>Analyzing domain and gathering intelligence...</Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {results && (
        <>
          {renderDomainInfo()}
          {renderDNSRecords()}
          {renderSubdomains()}
          {renderSecurityScan()}
        </>
      )}
    </Box>
  );
};

export default DomainIntelligence;