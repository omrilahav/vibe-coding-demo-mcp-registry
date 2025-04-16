import { createTheme } from '@mui/material/styles';

// Design system colors
const colors = {
  primary: {
    main: '#2563EB',
    dark: '#1E40AF',
    light: '#DBEAFE',
  },
  secondary: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    neutral: '#6B7280',
  },
  neutral: {
    white: '#FFFFFF',
    lightGray: '#F3F4F6',
    mediumGray: '#D1D5DB',
    darkGray: '#4B5563',
    black: '#1F2937',
  },
};

// Create MUI theme using our design system
const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary.main,
      dark: colors.primary.dark,
      light: colors.primary.light,
    },
    error: {
      main: colors.secondary.error,
    },
    warning: {
      main: colors.secondary.warning,
    },
    success: {
      main: colors.secondary.success,
    },
    text: {
      primary: colors.neutral.black,
      secondary: colors.neutral.darkGray,
    },
    background: {
      default: colors.neutral.white,
      paper: colors.neutral.white,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 16,
    h1: { fontSize: '1.875rem', fontWeight: 700 },
    h2: { fontSize: '1.5rem', fontWeight: 600 },
    h3: { fontSize: '1.25rem', fontWeight: 600 },
    h4: { fontSize: '1.125rem', fontWeight: 500 },
    h5: { fontSize: '1rem', fontWeight: 500 },
    h6: { fontSize: '0.875rem', fontWeight: 500 },
    body1: { fontSize: '1rem', fontWeight: 400 },
    body2: { fontSize: '0.875rem', fontWeight: 400 },
  },
  shape: {
    borderRadius: 6,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

export { colors, theme }; 