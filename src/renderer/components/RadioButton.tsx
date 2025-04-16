import React from 'react';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioProps as MuiRadioProps,
  RadioGroup,
  RadioGroupProps,
  FormHelperText,
  Typography,
} from '@mui/material';

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioButtonGroupProps extends Omit<RadioGroupProps, 'children'> {
  options: RadioOption[];
  label?: string;
  helper?: string;
  error?: boolean;
  errorText?: string;
}

const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
  options,
  label,
  helper,
  error = false,
  errorText,
  row = false,
  ...props
}) => {
  return (
    <FormControl component="fieldset" error={error}>
      {label && (
        <Typography 
          variant="body2" 
          component="legend" 
          sx={{ mb: 1, fontWeight: 500 }}
        >
          {label}
        </Typography>
      )}
      
      <RadioGroup row={row} {...props}>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      
      {(helper || errorText) && (
        <FormHelperText error={error}>
          {error ? errorText : helper}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default RadioButtonGroup; 