import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Stack,
  SelectChangeEvent
} from '@mui/material';
import TextInput from '../components/TextInput';
import Select from '../components/Select';
import { getCategories, submitServer } from '../services/api';

const SubmitServerPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    categories: [] as string[],
    license: '',
    documentationUrl: '',
    notes: ''
  });
  
  // Form validation state
  const [errors, setErrors] = useState({
    name: '',
    url: '',
    description: '',
    categories: '',
    license: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  
  const licenseOptions = [
    { value: 'mit', label: 'MIT' },
    { value: 'apache-2.0', label: 'Apache 2.0' },
    { value: 'gpl-3.0', label: 'GPL 3.0' },
    { value: 'proprietary', label: 'Proprietary' },
    { value: 'other', label: 'Other' }
  ];
  
  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      setFetchingCategories(true);
      try {
        const categories = await getCategories();
        setCategoryOptions(
          categories.map((category: { id: string; name: string }) => ({
            value: category.name,
            label: category.name
          }))
        );
      } catch (error) {
        console.error('Failed to load categories:', error);
        setSubmitStatus({
          success: false,
          message: 'Failed to load categories. Please refresh the page and try again.'
        });
      } finally {
        setFetchingCategories(false);
      }
    };
    
    loadCategories();
  }, []);
  
  // Handle text input changes
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for the field being updated
    if (name in errors) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle single select changes
  const handleSelectChange = (event: SelectChangeEvent<unknown>, child: React.ReactNode) => {
    const { name, value } = event.target;
    
    setFormData(prev => ({
      ...prev,
      [name as string]: value as string
    }));
    
    // Clear error for the field being updated
    if (name in errors) {
      setErrors(prev => ({
        ...prev,
        [name as string]: ''
      }));
    }
  };
  
  // Handle multi-select changes for categories
  const handleCategoryChange = (event: SelectChangeEvent<unknown>, child: React.ReactNode) => {
    const { value } = event.target;
    
    setFormData(prev => ({
      ...prev,
      categories: typeof value === 'string' ? [value] : (value as string[])
    }));
    
    if (errors.categories) {
      setErrors(prev => ({
        ...prev,
        categories: ''
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {
      name: '',
      url: '',
      description: '',
      categories: '',
      license: ''
    };
    
    let isValid = true;
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Server name is required';
      isValid = false;
    } else if (formData.name.length < 3) {
      newErrors.name = 'Server name must be at least 3 characters';
      isValid = false;
    }
    
    // URL validation
    if (!formData.url.trim()) {
      newErrors.url = 'Server URL is required';
      isValid = false;
    } else {
      try {
        new URL(formData.url);
      } catch (e) {
        newErrors.url = 'Please enter a valid URL';
        isValid = false;
      }
    }
    
    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
      isValid = false;
    }
    
    // Categories validation
    if (formData.categories.length === 0) {
      newErrors.categories = 'Please select at least one category';
      isValid = false;
    }
    
    // License validation
    if (!formData.license) {
      newErrors.license = 'License type is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setSubmitStatus(null);
    
    try {
      await submitServer(formData);
      setSubmitStatus({
        success: true,
        message: 'Server submitted successfully! It will be reviewed before being added to the registry.'
      });
      
      // Reset form after successful submission
      setFormData({
        name: '',
        url: '',
        description: '',
        categories: [],
        license: '',
        documentationUrl: '',
        notes: ''
      });
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error submitting server:', error);
      setSubmitStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit server. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Submit a New MCP Server
      </Typography>
      
      <Typography variant="body1" paragraph>
        Contribute to the MCP Registry by submitting a new server. Please provide accurate information to help others discover and use your server.
      </Typography>
      
      {submitStatus && (
        <Alert 
          severity={submitStatus.success ? 'success' : 'error'} 
          sx={{ mb: 3 }}
        >
          {submitStatus.message}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* Server Name */}
          <Grid item xs={12}>
            <TextInput
              required
              fullWidth
              id="name"
              name="name"
              label="Server Name"
              value={formData.name}
              onChange={handleTextInputChange}
              error={!!errors.name}
              errorText={errors.name}
              helper="The name of your MCP server"
            />
          </Grid>
          
          {/* Server URL */}
          <Grid item xs={12}>
            <TextInput
              required
              fullWidth
              id="url"
              name="url"
              label="Server URL or GitHub Repository"
              value={formData.url}
              onChange={handleTextInputChange}
              error={!!errors.url}
              errorText={errors.url}
              helper="URL to the server or GitHub repository"
            />
          </Grid>
          
          {/* Description */}
          <Grid item xs={12}>
            <TextInput
              required
              fullWidth
              id="description"
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleTextInputChange}
              error={!!errors.description}
              errorText={errors.description}
              helper="A brief description of what your server does"
              multiline
              rows={4}
            />
          </Grid>
          
          {/* Categories */}
          <Grid item xs={12} md={6}>
            <Select
              required
              fullWidth
              id="categories"
              name="categories"
              label="Categories"
              value={formData.categories}
              onChange={handleCategoryChange}
              error={!!errors.categories}
              errorText={errors.categories}
              helper="Select at least one category"
              options={categoryOptions}
              multiple
              disabled={fetchingCategories}
            />
          </Grid>
          
          {/* License */}
          <Grid item xs={12} md={6}>
            <Select
              required
              fullWidth
              id="license"
              name="license"
              label="License"
              value={formData.license}
              onChange={handleSelectChange}
              error={!!errors.license}
              errorText={errors.license}
              helper="Select the license type"
              options={licenseOptions}
            />
          </Grid>
          
          {/* Documentation URL */}
          <Grid item xs={12}>
            <TextInput
              fullWidth
              id="documentationUrl"
              name="documentationUrl"
              label="Documentation URL"
              value={formData.documentationUrl}
              onChange={handleTextInputChange}
              helper="Optional: Link to the documentation"
            />
          </Grid>
          
          {/* Additional Notes */}
          <Grid item xs={12}>
            <TextInput
              fullWidth
              id="notes"
              name="notes"
              label="Additional Notes"
              value={formData.notes}
              onChange={handleTextInputChange}
              helper="Optional: Any additional information about your server"
              multiline
              rows={3}
            />
          </Grid>
          
          {/* Submit and Cancel Buttons */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => navigate('/')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading || fetchingCategories}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Server'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default SubmitServerPage; 