import React from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { Refresh as RefreshIcon, BugReport as BugIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            backgroundColor: '#0f0f0f',
          }}
        >
          <Paper
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <BugIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            
            <Typography variant="h4" sx={{ mb: 2, color: 'white' }}>
              Oops! Something went wrong
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, color: 'grey.300' }}>
              InfoScape encountered an unexpected error. This usually happens when:
            </Typography>

            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2" component="div">
                • The backend server is not running<br/>
                • There's a network connectivity issue<br/>
                • A required dependency is missing<br/>
                • The browser doesn't support certain features
              </Typography>
            </Alert>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, color: 'white' }}>
                Quick Fix:
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.300' }}>
                1. Make sure the backend server is running (python main.py)<br/>
                2. Check your network connection<br/>
                3. Try refreshing the page<br/>
                4. Clear browser cache and reload
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={this.handleReload}
              startIcon={<RefreshIcon />}
              sx={{
                mr: 2,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #0097A7 90%)',
                },
              }}
            >
              Reload Application
            </Button>

            {this.props.onRetry && (
              <Button
                variant="outlined"
                onClick={this.props.onRetry}
                sx={{ color: 'white', borderColor: 'white' }}
              >
                Retry
              </Button>
            )}

            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 4, textAlign: 'left' }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'error.main' }}>
                  Development Error Details:
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 0, 0, 0.3)',
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  <Typography variant="body2" component="pre" sx={{ color: 'white', fontSize: '0.75rem' }}>
                    {this.state.error && this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
