import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import AppHeader from './AppHeader';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader />
      
      <Container component="main" sx={{ flexGrow: 1, py: 3 }} maxWidth="xl">
        {children}
      </Container>
      
      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          MCP Registry &copy; {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout; 