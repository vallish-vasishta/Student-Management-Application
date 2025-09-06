import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Stack,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Palette as PaletteIcon,
  Security as SecurityIcon,
  Help as HelpIcon,
  ChevronRight as ChevronRightIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import ChangePassword from './ChangePassword';
import { useTheme as useThemeContext } from '../contexts/ThemeContext';

const Settings = ({ open, onClose, onOpenProfile }) => {
  // Get user info from localStorage
  const userName = localStorage.getItem('userName') || 'Unknown User';
  const userRole = localStorage.getItem('userRole') || 'trainer';

  // Theme context
  const { themeMode, toggleTheme, setTheme } = useThemeContext();
  
  // Settings state
  const [openChangePassword, setOpenChangePassword] = useState(false);

  // Academy contact details (configurable)
  const academyDetails = {
    name: 'Shadows Dance Studio',
    email: 'info@shadowsdancestudio.com',
    phone: '+1 (555) 123-4567',
    address: '123 Dance Street, City, State 12345',
    hours: 'Mon-Fri: 9:00 AM - 8:00 PM, Sat-Sun: 10:00 AM - 6:00 PM'
  };

  // Handle theme change
  const handleThemeChange = (event) => {
    const newTheme = event.target.checked ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Handle account click - open profile dialog
  const handleAccountClick = () => {
    onClose();
    onOpenProfile(true); // Pass true to indicate opened from Settings
  };

  // Handle change password
  const handleChangePassword = () => {
    setOpenChangePassword(true);
  };

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
            <SettingsIcon sx={{ fontSize: '1.5rem' }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Settings
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

      <DialogContent sx={{ p: 0 }}>
        <List sx={{ p: 0 }}>
          {/* Account */}
          <ListItemButton onClick={handleAccountClick} sx={{ px: 3, py: 2 }}>
            <ListItemIcon>
              <PersonIcon sx={{ color: 'primary.main' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Account" 
              secondary="Manage your profile information"
            />
            <ChevronRightIcon sx={{ color: 'text.secondary' }} />
          </ListItemButton>

          <Divider />

          {/* Appearance */}
          <ListItem sx={{ px: 3, py: 2 }}>
            <ListItemIcon>
              <PaletteIcon sx={{ color: 'primary.main' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Appearance" 
              secondary="Customize your theme"
            />
              <FormControlLabel
                control={
                  <Switch
                    checked={themeMode === 'dark'}
                    onChange={handleThemeChange}
                    color="primary"
                  />
                }
                label={themeMode === 'dark' ? 'Dark' : 'Light'}
                sx={{ ml: 1 }}
              />
          </ListItem>

          <Divider />

          {/* Security & Privacy */}
          <ListItemButton onClick={handleChangePassword} sx={{ px: 3, py: 2 }}>
            <ListItemIcon>
              <SecurityIcon sx={{ color: 'primary.main' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Security & Privacy" 
              secondary="Change password and security settings"
            />
            <ChevronRightIcon sx={{ color: 'text.secondary' }} />
          </ListItemButton>

          <Divider />

          {/* Help and Support */}
          <ListItem sx={{ px: 3, py: 2 }}>
            <ListItemIcon>
              <HelpIcon sx={{ color: 'primary.main' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Help and Support" 
              secondary="Contact information and support"
            />
          </ListItem>
        </List>

        {/* Help and Support Details */}
        <Box sx={{ p: 3, pt: 0 }}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                {academyDetails.name}
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EmailIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {academyDetails.email}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PhoneIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      Phone
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {academyDetails.phone}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <LocationIcon sx={{ color: 'text.secondary', fontSize: '1.2rem', mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      Address
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {academyDetails.address}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <HelpIcon sx={{ color: 'text.secondary', fontSize: '1.2rem', mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      Hours
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {academyDetails.hours}
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  For technical support or account issues, please contact us during business hours.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{
            minWidth: 100,
            fontWeight: 500,
            borderRadius: 1.5,
            textTransform: 'none'
          }}
        >
          Close
        </Button>
      </DialogActions>

      {/* Change Password Dialog */}
      <ChangePassword
        open={openChangePassword}
        onClose={() => setOpenChangePassword(false)}
      />
    </Dialog>
  );
};

export default Settings;
