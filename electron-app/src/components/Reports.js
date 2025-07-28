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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  Description as DocIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

const Reports = () => {
  const { generateReport, getReports, loading, error } = useApp();
  
  const [reports, setReports] = useState([]);
  const [selectedSearchId, setSelectedSearchId] = useState('');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const reportFormats = [
    { value: 'pdf', label: 'PDF Report', icon: <PdfIcon /> },
    { value: 'csv', label: 'CSV Data', icon: <CsvIcon /> },
    { value: 'json', label: 'JSON Export', icon: <DocIcon /> },
    { value: 'docx', label: 'Word Document', icon: <DocIcon /> },
  ];

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const reportList = await getReports();
      setReports(reportList || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedSearchId || !reportName.trim()) return;

    try {
      const reportData = {
        search_id: selectedSearchId,
        format: reportFormat,
        name: reportName,
        description: reportDescription,
        options: {
          include_charts: true,
          include_timeline: true,
          include_raw_data: reportFormat === 'json',
          branding: true
        }
      };

      await generateReport(reportData);
      setShowGenerateDialog(false);
      setReportName('');
      setReportDescription('');
      loadReports(); // Refresh the reports list
    } catch (err) {
      console.error('Report generation failed:', err);
    }
  };

  const handleDownloadReport = (reportId) => {
    // Implement download functionality
    const link = document.createElement('a');
    link.href = `/api/reports/download/${reportId}`;
    link.download = `report-${reportId}`;
    link.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFormatIcon = (format) => {
    const formatData = reportFormats.find(f => f.value === format);
    return formatData ? formatData.icon : <DocIcon />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'generating':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom color="primary">
            Investigation Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate and manage comprehensive investigation reports
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowGenerateDialog(true)}
          disabled={loading}
        >
          Generate Report
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'An error occurred'}
        </Alert>
      )}

      {/* Reports List */}
      <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Generated Reports ({reports.length})
          </Typography>
          
          {reports.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
              <DocIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Reports Generated Yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generate your first investigation report to get started
              </Typography>
            </Paper>
          ) : (
            <List>
              {reports.map((report, index) => (
                <React.Fragment key={report.id}>
                  <ListItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      {getFormatIcon(report.format)}
                    </Box>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{report.name}</Typography>
                          <Chip 
                            label={report.status} 
                            size="small" 
                            color={getStatusColor(report.status)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {report.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Generated: {new Date(report.created_at).toLocaleString()} • 
                            Size: {formatFileSize(report.file_size)} • 
                            Format: {report.format.toUpperCase()}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDownloadReport(report.id)}
                          disabled={report.status !== 'completed'}
                        >
                          <DownloadIcon />
                        </IconButton>
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < reports.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Generate Report Dialog */}
      <Dialog 
        open={showGenerateDialog} 
        onClose={() => setShowGenerateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Generate New Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Report Name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Enter report name"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Enter report description (optional)"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Search/Investigation</InputLabel>
                <Select
                  value={selectedSearchId}
                  label="Search/Investigation"
                  onChange={(e) => setSelectedSearchId(e.target.value)}
                >
                  <MenuItem value="latest">Latest Search</MenuItem>
                  <MenuItem value="search-1">People Search - John Doe</MenuItem>
                  <MenuItem value="search-2">Domain Analysis - example.com</MenuItem>
                  <MenuItem value="search-3">Social Intel - @username</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Format</InputLabel>
                <Select
                  value={reportFormat}
                  label="Format"
                  onChange={(e) => setReportFormat(e.target.value)}
                >
                  {reportFormats.map((format) => (
                    <MenuItem key={format.value} value={format.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {format.icon}
                        {format.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGenerateDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerateReport}
            variant="contained"
            disabled={!selectedSearchId || !reportName.trim() || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;