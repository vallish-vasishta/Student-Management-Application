import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  MusicNote as MusicNoteIcon
} from '@mui/icons-material';
import api from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.login({ username, password });
      
      if (response.success) {
        // Store authentication and user information
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', response.user.role);
        localStorage.setItem('userName', response.user.full_name);
        localStorage.setItem('userId', response.user.id);
        
        // Navigate based on role
        if (response.user.role === 'trainer') {
          navigate('/dashboard?tab=attendance');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setError('Invalid credentials');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #F59E0B 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.08"%3E%3Ccircle cx="40" cy="40" r="3"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          animation: 'float 25s ease-in-out infinite',
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-30px) rotate(180deg)' },
        }
      }}
    >
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Studio Logo/Brand */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
              color: 'white',
              flexWrap: 'nowrap',
              width: '100%',
            }}
          >
            <MusicNoteIcon 
              sx={{ 
                fontSize: 56, 
                mr: 2,
                flexShrink: 0,
                animation: 'dance 3s ease-in-out infinite',
                '@keyframes dance': {
                  '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
                  '25%': { transform: 'scale(1.1) rotate(-5deg)' },
                  '50%': { transform: 'scale(1.2) rotate(0deg)' },
                  '75%': { transform: 'scale(1.1) rotate(5deg)' },
                }
              }} 
            />
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 800,
                textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                lineHeight: 1.1,
                background: 'linear-gradient(45deg, #FFFFFF, #FBBF24)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Shadows Dance Studio
            </Typography>
          </Box>

          {/* Login Card */}
          <Paper 
            elevation={24} 
            sx={{ 
              padding: 4, 
              width: '100%',
              maxWidth: 480,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 20px 60px rgba(139, 92, 246, 0.2)',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 30px 80px rgba(139, 92, 246, 0.3)',
                transition: 'all 0.3s ease-in-out',
              },
            }}
          >
            <Typography 
              component="h2" 
              variant="h4" 
              align="center" 
              sx={{ 
                mb: 3,
                fontWeight: 700,
                color: '#1F2937',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '80px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #8B5CF6, #F59E0B)',
                  margin: '20px auto 0',
                  borderRadius: '2px'
                }
              }}
            >
              Welcome Back
            </Typography>
            
            <Typography 
              variant="body1" 
              align="center" 
              sx={{ 
                mb: 4, 
                color: '#6B7280',
                fontStyle: 'italic',
                fontWeight: 500
              }}
            >
              Sign in to manage your dance studio
            </Typography>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    color: '#d32f2f'
                  }
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#8B5CF6' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 8,
                    '&:hover fieldset': {
                      borderColor: '#8B5CF6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#8B5CF6',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#8B5CF6',
                  },
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#8B5CF6' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        disabled={isLoading}
                        sx={{ color: '#8B5CF6' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 8,
                    '&:hover fieldset': {
                      borderColor: '#8B5CF6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#8B5CF6',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#8B5CF6',
                  },
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 4,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 35px rgba(139, 92, 246, 0.6)',
                  },
                  '&:disabled': {
                    background: '#E5E7EB',
                    transform: 'none',
                    boxShadow: 'none',
                  }
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#9CA3AF',
                  fontStyle: 'italic',
                  fontWeight: 500
                }}
              >
                Where passion meets rhythm
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Login; 