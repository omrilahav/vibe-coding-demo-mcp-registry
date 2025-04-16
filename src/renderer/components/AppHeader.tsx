import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Container,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink } from 'react-router-dom';
import SearchBar from './SearchBar';

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Categories', path: '/categories' },
  { label: 'Submit Server', path: '/submit' },
  { label: 'About', path: '/about' },
];

const AppHeader: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              color: 'primary.main',
              textDecoration: 'none',
              fontWeight: 600,
              flexGrow: { xs: 1, md: 0 },
            }}
          >
            MCP Registry
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              <Box sx={{ flexGrow: 1, display: 'flex' }}>
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      color: 'text.primary',
                      mx: 1,
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
              <Box sx={{ width: 300 }}>
                <SearchBar fullWidth />
              </Box>
            </>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexGrow: 1 }}>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="end"
                  onClick={handleDrawerToggle}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleDrawerToggle}
              >
                <Box
                  sx={{ width: 250 }}
                  role="presentation"
                  onClick={handleDrawerToggle}
                >
                  <List>
                    <ListItem>
                      <SearchBar fullWidth />
                    </ListItem>
                    {navItems.map((item) => (
                      <ListItem 
                        key={item.path} 
                        component={RouterLink} 
                        to={item.path}
                        sx={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <ListItemText primary={item.label} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Drawer>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default AppHeader; 