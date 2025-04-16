import React, { useState } from 'react';
import { InputBase, Paper, IconButton, Box, SxProps, Theme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  fullWidth?: boolean;
  initialValue?: string;
  sx?: SxProps<Theme>;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search MCP servers...',
  onSearch,
  fullWidth = true,
  initialValue = '',
  sx,
}) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    setValue('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: 1,
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider',
          ...sx
        }}
      >
        <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          inputProps={{ 'aria-label': 'search' }}
        />
        {value && (
          <IconButton
            sx={{ p: '10px' }}
            aria-label="clear"
            onClick={handleClear}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Paper>
    </Box>
  );
};

export default SearchBar; 