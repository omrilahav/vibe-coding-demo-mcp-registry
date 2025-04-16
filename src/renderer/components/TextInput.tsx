import React from 'react';
import { 
  TextField, 
  TextFieldProps, 
  InputAdornment, 
  FormHelperText, 
  FormControl,
  Typography
} from '@mui/material';

export interface TextInputProps extends Omit<TextFieldProps, 'variant'> {
  label?: string;
  helper?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  error?: boolean;
  errorText?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  helper,
  startIcon,
  endIcon,
  error = false,
  errorText,
  fullWidth = true,
  required = false,
  disabled = false,
  placeholder,
  ...props
}) => {
  return (
    <FormControl fullWidth={fullWidth} error={error}>
      {label && (
        <Typography 
          variant="body2" 
          component="label" 
          sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}
        >
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </Typography>
      )}
      
      <TextField
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        error={error}
        fullWidth={fullWidth}
        variant="outlined"
        size="medium"
        InputProps={{
          startAdornment: startIcon ? (
            <InputAdornment position="start">{startIcon}</InputAdornment>
          ) : undefined,
          endAdornment: endIcon ? (
            <InputAdornment position="end">{endIcon}</InputAdornment>
          ) : undefined,
        }}
        {...props}
      />
      
      {(helper || errorText) && (
        <FormHelperText error={error}>
          {error ? errorText : helper}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default TextInput; 