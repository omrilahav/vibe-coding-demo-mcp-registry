import React from 'react';
import { Typography, Paper, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        404 - Page Not Found
      </Typography>
      <Typography variant="body1" paragraph>
        The page you are looking for doesn't exist or has been moved.
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          component={RouterLink} 
          to="/"
        >
          Go Back to Home
        </Button>
      </Box>
    </Paper>
  );
};

export default NotFoundPage; 