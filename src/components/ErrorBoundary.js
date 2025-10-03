import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and any error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report to error tracking service if available
    if (window.electronAPI && window.electronAPI.logError) {
      window.electronAPI.logError({
        error: error.toString(),
        errorInfo: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }
  }

  handleReload = () => {
    // Clear error state and reload
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // Force a re-render by reloading the page
    window.location.reload();
  };

  handleReset = () => {
    // Just clear the error state
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#1a1a1a',
          color: '#fff',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            background: '#2d2d2d',
            padding: '30px',
            borderRadius: '8px',
            border: '1px solid #444'
          }}>
            <h1 style={{ 
              color: '#ff6b6b', 
              marginBottom: '20px',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              🚨 Application Error
            </h1>
            
            <p style={{ 
              fontSize: '16px', 
              lineHeight: '1.5',
              marginBottom: '20px',
              color: '#ccc'
            }}>
              InfoScope encountered an unexpected error. This helps us improve the application.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ 
                marginBottom: '20px',
                textAlign: 'left',
                background: '#1a1a1a',
                padding: '15px',
                borderRadius: '4px',
                border: '1px solid #555'
              }}>
                <summary style={{ 
                  cursor: 'pointer',
                  color: '#ffcd38',
                  fontWeight: 'bold',
                  marginBottom: '10px'
                }}>
                  Error Details (Development Mode)
                </summary>
                <div style={{ 
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#ff9999',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  <strong>Error:</strong> {this.state.error.toString()}
                  <br /><br />
                  <strong>Component Stack:</strong>
                  {this.state.errorInfo.componentStack}
                </div>
              </details>
            )}

            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#00d4aa',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#00b395'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#00d4aa'}
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4a9eff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2d88ff'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#4a9eff'}
              >
                Reload Application
              </button>
            </div>

            <div style={{ 
              marginTop: '30px',
              fontSize: '12px',
              color: '#888',
              borderTop: '1px solid #444',
              paddingTop: '20px'
            }}>
              <p>
                <strong>Need help?</strong><br />
                • Check the console for more details<br />
                • Report this issue on GitHub<br />
                • Restart the application if problems persist
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;