import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const MyProfile = ({ open, onClose, fromSettings = false, onBackToSettings }) => {
  // Get user data from localStorage
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || 'Unknown User';
  const userRole = localStorage.getItem('userRole') || 'trainer';
  const isActive = localStorage.getItem('isAuthenticated') === 'true';

  // Generate initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role color and display name
  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return { color: 'primary', label: 'Administrator', icon: <SecurityIcon /> };
      case 'trainer':
        return { color: 'success', label: 'Trainer', icon: <WorkIcon /> };
      default:
        return { color: 'default', label: 'User', icon: <PersonIcon /> };
    }
  };

  const roleInfo = getRoleInfo(userRole);

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            {fromSettings && (
              <IconButton
                onClick={onBackToSettings}
                sx={{ 
                  color: 'white',
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.1)' 
                  }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              My Profile
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
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
        {/* Profile Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              bgcolor: 'primary.main',
              fontSize: '2rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {getInitials(userName)}
          </Avatar>
          
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
            {userName}
          </Typography>
          
          <Chip
            icon={roleInfo.icon}
            label={roleInfo.label}
            color={roleInfo.color}
            variant="outlined"
            sx={{ 
              mb: 2,
              fontWeight: 500,
              borderWidth: 2,
              '& .MuiChip-icon': {
                fontSize: '1.1rem'
              }
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1.2rem' }} />
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
              Account Active
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Profile Information */}
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Card 
              variant="outlined" 
              sx={{ 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                  Personal Information
                </Typography>
                
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon sx={{ color: 'text.secondary', fontSize: '1.3rem' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        Full Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {userName}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <WorkIcon sx={{ color: 'text.secondary', fontSize: '1.3rem' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        Role
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {roleInfo.label}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SecurityIcon sx={{ color: 'text.secondary', fontSize: '1.3rem' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        User ID
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                        {userId || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarIcon sx={{ color: 'text.secondary', fontSize: '1.3rem' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        Account Status
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: 'success.main' }}>
                        Active
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* System Information */}
          <Grid item xs={12}>
            <Card 
              variant="outlined" 
              sx={{ 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                  System Information
                </Typography>
                
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EmailIcon sx={{ color: 'text.secondary', fontSize: '1.3rem' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        Authentication
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: 'success.main' }}>
                        {isActive ? 'Authenticated' : 'Not Authenticated'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarIcon sx={{ color: 'text.secondary', fontSize: '1.3rem' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        Last Updated
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date().toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{
            minWidth: 120,
            fontWeight: 500,
            borderRadius: 1.5,
            textTransform: 'none',
            px: 3
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MyProfile;
