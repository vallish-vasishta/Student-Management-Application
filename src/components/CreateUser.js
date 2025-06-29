import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Divider,
  Grid
} from '@mui/material';
import { 
  Add as AddIcon, 
  Close as CloseIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Badge as BadgeIcon,
  AdminPanelSettings as AdminIcon,
  School as TrainerIcon
} from '@mui/icons-material';
import api from '../services/api';

const CreateUser = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'trainer',
    full_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username || !formData.password || !formData.full_name) {
      setSnackbar({
        open: true,
        message: 'All fields are required',
        severity: 'error'
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'Passwords do not match',
        severity: 'error'
      });
      return;
    }

    if (formData.password.length < 6) {
      setSnackbar({
        open: true,
        message: 'Password must be at least 6 characters long',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const userData = {
        username: formData.username,
        password: formData.password,
        role: formData.role,
        full_name: formData.full_name
      };

      await api.createUser(userData);
      
      setSnackbar({
        open: true,
        message: 'User created successfully!',
        severity: 'success'
      });

      // Reset form
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'trainer',
        full_name: ''
      });

      // Call onSuccess callback to close dialog
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Error creating user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create user',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Header with close button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        pb: 2,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: '#333' }}>
            Create New User
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            color: '#666',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              color: '#333'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Form */}
      <Paper sx={{ 
        p: 4, 
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        border: '1px solid #e8e8e8'
      }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Username Field */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'primary.main',
                  },
                }}
              />
            </Grid>

            {/* Full Name Field */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <BadgeIcon sx={{ mr: 1, color: 'primary.main' }} />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'primary.main',
                  },
                }}
              />
            </Grid>

            {/* Password Field */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                helperText="Password must be at least 6 characters long"
                InputProps={{
                  startAdornment: (
                    <LockIcon sx={{ mr: 1, color: 'primary.main' }} />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'primary.main',
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                  },
                }}
              />
            </Grid>

            {/* Confirm Password Field */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <LockIcon sx={{ mr: 1, color: 'primary.main' }} />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'primary.main',
                  },
                }}
              />
            </Grid>

            {/* Role Field */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                  disabled={loading}
                  startAdornment={
                    formData.role === 'admin' ? (
                      <AdminIcon sx={{ mr: 1, color: 'primary.main' }} />
                    ) : (
                      <TrainerIcon sx={{ mr: 1, color: 'primary.main' }} />
                    )
                  }
                  sx={{
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <MenuItem value="admin">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AdminIcon sx={{ mr: 1, fontSize: 20 }} />
                      Admin
                    </Box>
                  </MenuItem>
                  <MenuItem value="trainer">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrainerIcon sx={{ mr: 1, fontSize: 20 }} />
                      Trainer
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={loading}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
              disabled={loading}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                },
                '&:disabled': {
                  background: '#ccc',
                  boxShadow: 'none',
                }
              }}
            >
              {loading ? 'Creating User...' : 'Create User'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateUser; 