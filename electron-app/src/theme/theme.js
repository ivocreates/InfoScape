import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4ff',
      light: '#33ddff',
      dark: '#0099cc',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff6b35',
      light: '#ff8a5b',
      dark: '#cc5529',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f0f0f',
      paper: 'rgba(255, 255, 255, 0.05)',
    },
    surface: {
      main: 'rgba(255, 255, 255, 0.08)',
      light: 'rgba(255, 255, 255, 0.12)',
      dark: 'rgba(255, 255, 255, 0.04)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
      disabled: '#888888',
    },
    divider: 'rgba(0, 212, 255, 0.2)',
    success: {
      main: '#4caf50',
      light: '#66bb6a',
      dark: '#388e3c',
    },
    warning: {
      main: '#ffc107',
      light: '#ffcd38',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',
      light: '#ef5350',
      dark: '#d32f2f',
    },
    info: {
      main: '#2196f3',
      light: '#42a5f5',
      dark: '#1976d2',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      color: '#00d4ff',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
      color: '#00d4ff',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: '#ffffff',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      color: '#ffffff',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.125rem',
      lineHeight: 1.4,
      color: '#ffffff',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.4,
      color: '#ffffff',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#cccccc',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#cccccc',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '0.875rem',
    },
    caption: {
      fontSize: '0.75rem',
      color: '#888888',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#888888',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.1)',
    '0px 4px 8px rgba(0, 0, 0, 0.15)',
    '0px 8px 16px rgba(0, 0, 0, 0.2)',
    '0px 12px 24px rgba(0, 0, 0, 0.25)',
    '0px 16px 32px rgba(0, 0, 0, 0.3)',
    '0px 20px 40px rgba(0, 0, 0, 0.35)',
    '0px 24px 48px rgba(0, 0, 0, 0.4)',
    '0px 2px 4px rgba(0, 212, 255, 0.1)',
    '0px 4px 8px rgba(0, 212, 255, 0.15)',
    '0px 8px 16px rgba(0, 212, 255, 0.2)',
    '0px 12px 24px rgba(0, 212, 255, 0.25)',
    '0px 16px 32px rgba(0, 212, 255, 0.3)',
    '0px 20px 40px rgba(0, 212, 255, 0.35)',
    '0px 24px 48px rgba(0, 212, 255, 0.4)',
    '0px 28px 56px rgba(0, 212, 255, 0.45)',
    '0px 32px 64px rgba(0, 212, 255, 0.5)',
    '0px 36px 72px rgba(0, 212, 255, 0.55)',
    '0px 40px 80px rgba(0, 212, 255, 0.6)',
    '0px 44px 88px rgba(0, 212, 255, 0.65)',
    '0px 48px 96px rgba(0, 212, 255, 0.7)',
    '0px 52px 104px rgba(0, 212, 255, 0.75)',
    '0px 56px 112px rgba(0, 212, 255, 0.8)',
    '0px 60px 120px rgba(0, 212, 255, 0.85)',
    '0px 64px 128px rgba(0, 212, 255, 0.9)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 212, 255, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #00e6ff 0%, #00b3e6 100%)',
          },
        },
        outlined: {
          borderColor: 'rgba(0, 212, 255, 0.5)',
          color: '#00d4ff',
          '&:hover': {
            borderColor: '#00d4ff',
            backgroundColor: 'rgba(0, 212, 255, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: 16,
          backdropFilter: 'blur(10px)',
          '&:hover': {
            borderColor: 'rgba(0, 212, 255, 0.4)',
            boxShadow: '0px 8px 32px rgba(0, 212, 255, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(0, 212, 255, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 212, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00d4ff',
              boxShadow: '0px 0px 0px 3px rgba(0, 212, 255, 0.1)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
        },
        filled: {
          background: 'rgba(0, 212, 255, 0.2)',
          color: '#00d4ff',
          border: '1px solid rgba(0, 212, 255, 0.3)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(26, 26, 26, 0.8) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(26, 26, 26, 0.9) 100%)',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(0, 212, 255, 0.2)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&:hover': {
            backgroundColor: 'rgba(0, 212, 255, 0.1)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 212, 255, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(0, 212, 255, 0.3)',
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          '&.Mui-selected': {
            color: '#00d4ff',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#00d4ff',
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          fontSize: '0.75rem',
          borderRadius: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(135deg, rgba(15, 15, 15, 0.95) 0%, rgba(26, 26, 26, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
        },
      },
    },
  },
});
