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
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Palette as PaletteIcon,
  Security as SecurityIcon,
  Help as HelpIcon,
  ChevronRight as ChevronRightIcon,
  Lock as LockIcon
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
