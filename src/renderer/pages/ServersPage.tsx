import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Slider,
  Radio,
  RadioGroup,
  Checkbox,
  MenuItem,
  Select,
  Pagination,
  useMediaQuery,
  IconButton,
  Drawer,
  Button,
  SelectChangeEvent,
  Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchServers, getCategories } from '../services/api';
import ServerCard from '../components/ServerCard';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';

// Define interfaces for our data
interface Server {
  id: string;
  name: string;
  description: string;
  url: string;
  reputationScore: number;
  categories: Array<{name: string}> | string[];
  licenseType: string;
  lastUpdated: string;
}

// Add category interface
interface Category {
  id: string;
  name: string;
  count?: number;
}

interface SearchResponse {
  data: Server[];
  total: number;
  page: number;
  limit: number;
}

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48];
const SORT_OPTIONS = [
  { value: 'reputation', label: 'Reputation Score' },
  { value: 'lastUpdated', label: 'Last Updated' },
  { value: 'name', label: 'Name' }
];
const LICENSE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open Source' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'free', label: 'Free' }
];
const UPDATED_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'Last 3 Months' },
  { value: 'year', label: 'Last Year' }
];

const ServersPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Filter panel drawer state for mobile
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  // State for all filter parameters
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.getAll('categories') || []
  );
  const [licenseType, setLicenseType] = useState(
    searchParams.get('license') || 'all'
  );
  const [reputationRange, setReputationRange] = useState<[number, number]>([
    Number(searchParams.get('minScore')) || 0,
    Number(searchParams.get('maxScore')) || 5
  ]);
  const [lastUpdated, setLastUpdated] = useState(
    searchParams.get('lastUpdated') || 'all'
  );
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(
    Number(searchParams.get('limit')) || ITEMS_PER_PAGE_OPTIONS[0]
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get('sort') || 'reputation'
  );
  
  // State for API data
  const [categories, setCategories] = useState<Category[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [totalServers, setTotalServers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load categories when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to load categories:', err);
        // Not setting error state here as it's not critical
      }
    };
    
    loadCategories();
  }, []);
  
  // Load servers based on search parameters
  useEffect(() => {
    const loadServers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await searchServers({
          query: query || undefined,
          categories: selectedCategories.length > 0 ? selectedCategories : undefined,
          license: licenseType !== 'all' ? licenseType : undefined,
          minScore: reputationRange[0] > 0 ? reputationRange[0] : undefined,
          maxScore: reputationRange[1] < 5 ? reputationRange[1] : undefined,
          lastUpdated: lastUpdated !== 'all' ? lastUpdated : undefined,
          page,
          limit: itemsPerPage,
          sort: sortBy
        });
        
        setServers(response.data);
        setTotalServers(response.total);
      } catch (err: any) {
        console.error('Failed to load servers:', err);
        setError(err.message || 'Failed to load servers. Please try again.');
        setServers([]);
        setTotalServers(0);
      } finally {
        setLoading(false);
      }
    };
    
    loadServers();
  }, [query, selectedCategories, licenseType, reputationRange, lastUpdated, page, itemsPerPage, sortBy]);
  
  // Update URL parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (query) params.append('q', query);
    selectedCategories.forEach(cat => params.append('categories', cat));
    if (licenseType !== 'all') params.append('license', licenseType);
    if (reputationRange[0] > 0) params.append('minScore', reputationRange[0].toString());
    if (reputationRange[1] < 5) params.append('maxScore', reputationRange[1].toString());
    if (lastUpdated !== 'all') params.append('lastUpdated', lastUpdated);
    if (page > 1) params.append('page', page.toString());
    if (itemsPerPage !== ITEMS_PER_PAGE_OPTIONS[0]) params.append('limit', itemsPerPage.toString());
    if (sortBy !== 'reputation') params.append('sort', sortBy);
    
    setSearchParams(params);
  }, [query, selectedCategories, licenseType, reputationRange, lastUpdated, page, itemsPerPage, sortBy, setSearchParams]);
  
  // Handle search submission
  const handleSearch = (value: string) => {
    setQuery(value);
    setPage(1); // Reset to first page on new search
  };
  
  // Handle category filter changes
  const handleCategoryChange = (category: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
    setPage(1); // Reset to first page
  };
  
  // Handle license type change
  const handleLicenseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLicenseType(event.target.value);
    setPage(1); // Reset to first page
  };
  
  // Handle reputation range change
  const handleReputationChange = (event: Event, newValue: number | number[]) => {
    setReputationRange(newValue as [number, number]);
    setPage(1); // Reset to first page
  };
  
  // Handle last updated filter change
  const handleLastUpdatedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLastUpdated(event.target.value);
    setPage(1); // Reset to first page
  };
  
  // Handle pagination change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0); // Scroll to top when changing pages
  };
  
  // Handle items per page change
  const handleItemsPerPageChange = (event: SelectChangeEvent<number>) => {
    setItemsPerPage(Number(event.target.value));
    setPage(1); // Reset to first page
  };
  
  // Handle sort change
  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortBy(event.target.value);
    setPage(1); // Reset to first page
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategories([]);
    setLicenseType('all');
    setReputationRange([0, 5]);
    setLastUpdated('all');
    setPage(1);
    // Don't reset the search query, sort or items per page as these are not "filters"
  };
  
  // Filter panel component
  const FilterPanel = () => (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Filters</Typography>
        <Button 
          size="small" 
          onClick={handleResetFilters}
          disabled={
            selectedCategories.length === 0 && 
            licenseType === 'all' && 
            reputationRange[0] === 0 &&
            reputationRange[1] === 5 &&
            lastUpdated === 'all'
          }
        >
          Reset
        </Button>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Typography variant="subtitle2" gutterBottom>Categories</Typography>
      <Box sx={{ mb: 3, maxHeight: '200px', overflowY: 'auto' }}>
        {categories.length > 0 ? (
          categories.map(category => (
            <FormControlLabel
              key={category.id}
              control={
                <Checkbox
                  checked={selectedCategories.includes(category.name)}
                  onChange={handleCategoryChange(category.name)}
                  size="small"
                />
              }
              label={category.name}
            />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">Loading categories...</Typography>
        )}
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Typography variant="subtitle2" gutterBottom>License Type</Typography>
      <RadioGroup 
        value={licenseType} 
        onChange={handleLicenseChange}
        sx={{ mb: 3 }}
      >
        {LICENSE_OPTIONS.map(option => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio size="small" />}
            label={<Typography variant="body2">{option.label}</Typography>}
          />
        ))}
      </RadioGroup>
      
      <Divider sx={{ mb: 2 }} />
      
      <Typography variant="subtitle2" gutterBottom>
        Reputation Score: {reputationRange[0].toFixed(1)} - {reputationRange[1].toFixed(1)}
      </Typography>
      <Box sx={{ px: 1, mb: 3 }}>
        <Slider
          value={reputationRange}
          onChange={handleReputationChange}
          valueLabelDisplay="auto"
          min={0}
          max={5}
          step={0.1}
          marks={[
            { value: 0, label: '0' },
            { value: 5, label: '5' }
          ]}
        />
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Typography variant="subtitle2" gutterBottom>Last Updated</Typography>
      <RadioGroup 
        value={lastUpdated} 
        onChange={handleLastUpdatedChange}
      >
        {UPDATED_OPTIONS.map(option => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio size="small" />}
            label={<Typography variant="body2">{option.label}</Typography>}
          />
        ))}
      </RadioGroup>
    </Paper>
  );
  
  const totalPages = Math.ceil(totalServers / itemsPerPage);
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        MCP Servers Directory
      </Typography>
      
      {/* Search and filter controls */}
      <Box sx={{ mb: 3 }}>
        <SearchBar 
          onSearch={handleSearch} 
          initialValue={query}
          placeholder="Search by name, description, or keywords..."
        />
      </Box>
      
      {/* Mobile Filter Button */}
      {isMobile && (
        <Box sx={{ mb: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />}
            onClick={() => setFilterDrawerOpen(true)}
            fullWidth
          >
            Filters
          </Button>
        </Box>
      )}
      
      {/* Results count, sort and items per page controls */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 1 : 0
      }}>
        <Typography variant="body2" color="text.secondary">
          {loading ? 'Loading...' : `Showing ${servers.length} of ${totalServers} servers`}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          width: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'space-between' : 'flex-end'
        }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={sortBy}
              onChange={handleSortChange}
              displayEmpty
              variant="outlined"
            >
              <MenuItem disabled value="">
                <em>Sort by</em>
              </MenuItem>
              {SORT_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              displayEmpty
              variant="outlined"
            >
              {ITEMS_PER_PAGE_OPTIONS.map(option => (
                <MenuItem key={option} value={option}>
                  {option} per page
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {/* Main content area with filters and results */}
      <Grid container spacing={3}>
        {/* Filter panel - desktop */}
        {!isMobile && (
          <Grid item xs={12} md={3} lg={2}>
            <FilterPanel />
          </Grid>
        )}
        
        {/* Results area */}
        <Grid item xs={12} md={9} lg={10}>
          {loading ? (
            <LoadingState message="Loading servers..." />
          ) : error ? (
            <ErrorState 
              title="Failed to load servers" 
              description={error}
              retry={() => {
                setLoading(true);
                window.location.reload();
              }}
            />
          ) : servers.length === 0 ? (
            <EmptyState 
              title="No servers found" 
              description="Try adjusting your search criteria"
              actionButton={{
                label: "Clear filters",
                onClick: handleResetFilters
              }}
            />
          ) : (
            <>
              <Grid container spacing={2}>
                {servers.map(server => (
                  <Grid item xs={12} sm={6} md={6} lg={4} key={server.id}>
                    <ServerCard
                      id={server.id}
                      name={server.name}
                      description={server.description}
                      reputation={server.reputationScore}
                      categories={Array.isArray(server.categories) 
                        ? server.categories.map(cat => typeof cat === 'object' && 'name' in cat ? cat.name : cat) 
                        : []}
                    />
                  </Grid>
                ))}
              </Grid>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                  <Pagination 
                    count={totalPages} 
                    page={page} 
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
      
      {/* Filter drawer for mobile view */}
      <Drawer
        anchor="left"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: { width: '80%', maxWidth: '300px' }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              &times;
            </IconButton>
          </Box>
          <FilterPanel />
        </Box>
      </Drawer>
    </Box>
  );
};

export default ServersPage; 