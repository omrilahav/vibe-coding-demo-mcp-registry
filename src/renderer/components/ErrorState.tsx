import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  retry?: () => void;
  goBack?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'An error occurred while processing your request. Please try again.',
  retry,
  goBack,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
        my: 2,
        minHeight: 200,
        backgroundColor: '#FFEBEE',
        borderRadius: 1,
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main' }} />
      
      <Typography variant="h6" component="h3" sx={{ mt: 2, color: 'error.main' }}>
        {title}
      </Typography>
      
      <Typography variant="body2" sx={{ mt: 1, maxWidth: 400 }}>
        {description}
      </Typography>
      
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        {retry && (
          <Button
            variant="contained"
            color="primary"
            onClick={retry}
          >
            Try Again
          </Button>
        )}
        
        {goBack && (
          <Button
            variant="outlined"
            color="primary"
            onClick={goBack}
          >
            Go Back
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ErrorState; 