import React, { useState, useEffect } from 'react';
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
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  VpnKey as VpnKeyIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

const Settings = () => {
  const { updateSettings, getSettings, loading, error } = useApp();
  
  const [settings, setSettings] = useState({
    // General Settings
    theme: 'dark',
    language: 'en',
    autoSave: true,
    notifications: true,
    
    // Search Settings
    defaultSearchDepth: 'standard',
    enableRateLimit: true,
    maxConcurrentSearches: 5,
    searchTimeout: 30,
    
    // Privacy Settings
    enableVPN: false,
    clearHistoryAfter: '30',
    encryptLocalData: true,
    anonymousMode: false,
    
    // API Settings
    enableExternalAPIs: true,
    apiRateLimit: 100,
    cacheResults: true,
    cacheExpiry: 24,
    
    // Export Settings
    defaultExportFormat: 'pdf',
    includeRawData: false,
    watermarkReports: true,
    compressExports: true,
  });

  const [apiKeys, setApiKeys] = useState([]);
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState({ service: '', key: '', description: '' });

  const themes = [
    { value: 'dark', label: 'Dark Theme' },
    { value: 'light', label: 'Light Theme' },
    { value: 'auto', label: 'Auto (System)' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
  ];

  const searchDepths = [
    { value: 'basic', label: 'Basic (Faster)' },
    { value: 'standard', label: 'Standard (Recommended)' },
    { value: 'deep', label: 'Deep (Thorough)' },
    { value: 'exhaustive', label: 'Exhaustive (Slow)' },
  ];

  const exportFormats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'docx', label: 'Word Document' },
    { value: 'csv', label: 'CSV' },
    { value: 'json', label: 'JSON' },
  ];

  const apiServices = [
    { value: 'shodan', label: 'Shodan API' },
    { value: 'virustotal', label: 'VirusTotal API' },
    { value: 'haveibeenpwned', label: 'Have I Been Pwned' },
    { value: 'hunter', label: 'Hunter.io' },
    { value: 'clearbit', label: 'Clearbit API' },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await getSettings();
      if (savedSettings) {
        setSettings(prev => ({ ...prev, ...savedSettings }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings(settings);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleAddApiKey = () => {
    if (newApiKey.service && newApiKey.key) {
      setApiKeys(prev => [...prev, { ...newApiKey, id: Date.now() }]);
      setNewApiKey({ service: '', key: '', description: '' });
      setShowApiDialog(false);
    }
  };

  const handleDeleteApiKey = (id) => {
    setApiKeys(prev => prev.filter(key => key.id !== id));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom color="primary">
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure InfoScape for optimal performance and security
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          disabled={loading}
        >
          Save Changes
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'An error occurred'}
        </Alert>
      )}

      {/* General Settings */}
      <Accordion defaultExpanded sx={{ mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">General Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={settings.theme}
                  label="Theme"
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                >
                  {themes.map((theme) => (
                    <MenuItem key={theme.value} value={theme.value}>
                      {theme.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.language}
                  label="Language"
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                >
                  {languages.map((lang) => (
                    <MenuItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                  />
                }
                label="Auto-save search results"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  />
                }
                label="Enable notifications"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Search Settings */}
      <Accordion sx={{ mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Search Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Default Search Depth</InputLabel>
                <Select
                  value={settings.defaultSearchDepth}
                  label="Default Search Depth"
                  onChange={(e) => handleSettingChange('defaultSearchDepth', e.target.value)}
                >
                  {searchDepths.map((depth) => (
                    <MenuItem key={depth.value} value={depth.value}>
                      {depth.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search Timeout (seconds)"
                type="number"
                value={settings.searchTimeout}
                onChange={(e) => handleSettingChange('searchTimeout', parseInt(e.target.value))}
                inputProps={{ min: 10, max: 300 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Concurrent Searches"
                type="number"
                value={settings.maxConcurrentSearches}
                onChange={(e) => handleSettingChange('maxConcurrentSearches', parseInt(e.target.value))}
                inputProps={{ min: 1, max: 20 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableRateLimit}
                    onChange={(e) => handleSettingChange('enableRateLimit', e.target.checked)}
                  />
                }
                label="Enable rate limiting (recommended)"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Privacy & Security */}
      <Accordion sx={{ mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Privacy & Security</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.encryptLocalData}
                    onChange={(e) => handleSettingChange('encryptLocalData', e.target.checked)}
                  />
                }
                label="Encrypt local data storage"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.anonymousMode}
                    onChange={(e) => handleSettingChange('anonymousMode', e.target.checked)}
                  />
                }
                label="Anonymous mode (hide identifying information)"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Clear history after (days)"
                type="number"
                value={settings.clearHistoryAfter}
                onChange={(e) => handleSettingChange('clearHistoryAfter', e.target.value)}
                inputProps={{ min: 1, max: 365 }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* API Configuration */}
      <Accordion sx={{ mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">API Configuration</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">API Keys</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowApiDialog(true)}
                size="small"
              >
                Add API Key
              </Button>
            </Box>
            
            {apiKeys.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No API keys configured
              </Typography>
            ) : (
              <List>
                {apiKeys.map((apiKey, index) => (
                  <React.Fragment key={apiKey.id}>
                    <ListItem>
                      <ListItemText
                        primary={apiKey.service}
                        secondary={apiKey.description}
                      />
                      <ListItemSecondaryAction>
                        <IconButton size="small" color="error" onClick={() => handleDeleteApiKey(apiKey.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < apiKeys.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableExternalAPIs}
                    onChange={(e) => handleSettingChange('enableExternalAPIs', e.target.checked)}
                  />
                }
                label="Enable external API integrations"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="API Rate Limit (requests/hour)"
                type="number"
                value={settings.apiRateLimit}
                onChange={(e) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
                inputProps={{ min: 10, max: 1000 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cache Expiry (hours)"
                type="number"
                value={settings.cacheExpiry}
                onChange={(e) => handleSettingChange('cacheExpiry', parseInt(e.target.value))}
                inputProps={{ min: 1, max: 168 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.cacheResults}
                    onChange={(e) => handleSettingChange('cacheResults', e.target.checked)}
                  />
                }
                label="Cache search results"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Export Settings */}
      <Accordion sx={{ mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Export Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Default Export Format</InputLabel>
                <Select
                  value={settings.defaultExportFormat}
                  label="Default Export Format"
                  onChange={(e) => handleSettingChange('defaultExportFormat', e.target.value)}
                >
                  {exportFormats.map((format) => (
                    <MenuItem key={format.value} value={format.value}>
                      {format.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.includeRawData}
                    onChange={(e) => handleSettingChange('includeRawData', e.target.checked)}
                  />
                }
                label="Include raw data in exports"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.watermarkReports}
                    onChange={(e) => handleSettingChange('watermarkReports', e.target.checked)}
                  />
                }
                label="Add watermark to reports"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.compressExports}
                    onChange={(e) => handleSettingChange('compressExports', e.target.checked)}
                  />
                }
                label="Compress export files"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Add API Key Dialog */}
      <Dialog open={showApiDialog} onClose={() => setShowApiDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add API Key</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Service</InputLabel>
                <Select
                  value={newApiKey.service}
                  label="Service"
                  onChange={(e) => setNewApiKey(prev => ({ ...prev, service: e.target.value }))}
                >
                  {apiServices.map((service) => (
                    <MenuItem key={service.value} value={service.value}>
                      {service.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="API Key"
                type="password"
                value={newApiKey.key}
                onChange={(e) => setNewApiKey(prev => ({ ...prev, key: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (optional)"
                value={newApiKey.description}
                onChange={(e) => setNewApiKey(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApiDialog(false)}>Cancel</Button>
          <Button onClick={handleAddApiKey} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;