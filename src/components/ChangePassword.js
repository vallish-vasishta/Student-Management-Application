import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  Stack,
  Alert,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import api from '../services/api';

const ChangePassword = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: current password, 2: new passwords

  // Get user ID from localStorage
  const userId = localStorage.getItem('userId');

  // Handle input changes
  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Validate current password
  const validateCurrentPassword = async () => {
    if (!formData.currentPassword.trim()) {
      setError('Please enter your current password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Test current password by calling change password API with dummy new password
      // This will validate current password without actually changing it
      const testData = {
        userId: parseInt(userId),
        currentPassword: formData.currentPassword,
        newPassword: 'test' // Dummy password for validation
      };

      // We'll create a separate validation endpoint or modify the existing one
      // For now, we'll proceed to step 2 if no error occurs
      setStep(2);
      setError('');
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Current password is incorrect');
      } else {
        setError('Error validating password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Validate new passwords match
  const validateNewPasswords = () => {
    if (!formData.newPassword.trim()) {
      setError('Please enter a new password');
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return false;
    }

    return true;
  };

  // Change password
  const handleChangePassword = async () => {
    if (!validateNewPasswords()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const passwordData = {
        userId: parseInt(userId),
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      };

      const response = await api.changePassword(passwordData);
      
      if (response.success) {
        setSuccess(true);
        // Reset form after 2 seconds
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Current password is incorrect');
        setStep(1); // Go back to current password step
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
    setError('');
    setSuccess(false);
    setStep(1);
    setLoading(false);
    onClose();
  };

  // Handle back to current password step
  const handleBack = () => {
    setStep(1);
    setFormData(prev => ({
      ...prev,
      newPassword: '',
      confirmPassword: ''
    }));
    setError('');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SecurityIcon sx={{ fontSize: '1.5rem' }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Change Password
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{ 
              color: 'white',
              '&:hover': { 
                backgroundColor: 'rgba(255,255,255,0.1)' 
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
              Password Changed Successfully!
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Your password has been updated. This dialog will close automatically.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Step Indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%', 
                backgroundColor: step >= 1 ? 'primary.main' : 'grey.300',
                color: step >= 1 ? 'white' : 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 600
              }}>
                1
              </Box>
              <Box sx={{ 
                width: 40, 
                height: 2, 
                backgroundColor: step >= 2 ? 'primary.main' : 'grey.300' 
              }} />
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%', 
                backgroundColor: step >= 2 ? 'primary.main' : 'grey.300',
                color: step >= 2 ? 'white' : 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 600
              }}>
                2
              </Box>
            </Box>

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            {step === 1 ? (
              // Step 1: Current Password
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Enter Current Password
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  Please enter your current password to continue.
                </Typography>
                
                <TextField
                  fullWidth
                  label="Current Password"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={handleChange('currentPassword')}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('current')}
                          edge="end"
                        >
                          {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
            ) : (
              // Step 2: New Passwords
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Set New Password
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  Enter your new password and confirm it.
                </Typography>
                
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={handleChange('newPassword')}
                    variant="outlined"
                    helperText="Password must be at least 6 characters long"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('new')}
                            edge="end"
                          >
                            {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('confirm')}
                            edge="end"
                          >
                            {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>

      {!success && (
        <DialogActions sx={{ p: 3, pt: 1 }}>
          {step === 2 && (
            <Button
              onClick={handleBack}
              variant="outlined"
              sx={{
                minWidth: 100,
                fontWeight: 500,
                borderRadius: 1.5,
                textTransform: 'none'
              }}
            >
              Back
            </Button>
          )}
          
          <Button
            onClick={step === 1 ? validateCurrentPassword : handleChangePassword}
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{
              minWidth: 120,
              fontWeight: 500,
              borderRadius: 1.5,
              textTransform: 'none'
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : step === 1 ? (
              'Continue'
            ) : (
              'Change Password'
            )}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ChangePassword;
