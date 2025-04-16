import React from 'react';
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  SelectProps as MuiSelectProps,
  FormHelperText,
  Typography,
  Box
} from '@mui/material';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends Omit<MuiSelectProps, 'label'> {
  options: SelectOption[];
  label?: string;
  helper?: string;
  error?: boolean;
  errorText?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  label,
  helper,
  error = false,
  errorText,
  required = false,
  fullWidth = true,
  placeholder = 'Select an option',
  ...props
}) => {
  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <Typography 
          variant="body2" 
          component="label" 
          sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}
        >
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </Typography>
      )}
      
      <FormControl fullWidth={fullWidth} error={error}>
        <MuiSelect
          displayEmpty
          fullWidth={fullWidth}
          renderValue={(selected) => {
            if (!selected || (Array.isArray(selected) && selected.length === 0)) {
              return <em>{placeholder}</em>;
            }
            
            const selectedOption = options.find(option => option.value === selected);
            return selectedOption ? selectedOption.label : String(selected);
          }}
          {...props}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </MuiSelect>
        
        {(helper || errorText) && (
          <FormHelperText error={error}>
            {error ? errorText : helper}
          </FormHelperText>
        )}
      </FormControl>
    </Box>
  );
};

export default Select; 