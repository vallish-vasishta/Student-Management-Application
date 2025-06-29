import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  Fade,
  Zoom,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  AdminPanelSettings as AdminIcon,
  School as TrainerIcon,
  Person as PersonIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  FilterList as FilterIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../services/api';

const ListUsers = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getUsers();
      setUsers(response.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      await api.deleteUser(userToDelete.id);
      
      // Remove the user from the local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
      
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success'
      });
      
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete user',
        severity: 'error'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role) => {
    return role === 'admin' ? <AdminIcon /> : <TrainerIcon />;
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? 'error' : 'primary';
  };

  const getStatusIcon = (isActive) => {
    return isActive ? <ActiveIcon color="success" /> : <InactiveIcon color="error" />;
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'error';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  };

  // Calculate statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    admin: users.filter(u => u.role === 'admin').length,
    trainer: users.filter(u => u.role === 'trainer').length,
    inactive: users.filter(u => !u.is_active).length
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        p: 6,
        minHeight: '400px'
      }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Loading users...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', p: 3 }}>
      {/* Enhanced Header */}
      <Fade in timeout={800}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            animation: 'float 20s ease-in-out infinite',
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
          }
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                borderRadius: '50%', 
                p: 2, 
                mr: 3,
                backdropFilter: 'blur(10px)'
              }}>
                <GroupIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
                  User Management
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Manage all system users and their permissions
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {filteredUsers.length} of {users.length} users
              </Typography>
              <Tooltip title="Refresh">
                <IconButton 
                  onClick={handleRefresh} 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Close">
                <IconButton 
                  onClick={onClose} 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Statistics Cards */}
      <Zoom in timeout={1000}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <GroupIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <ActiveIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.active}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Active Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(244, 67, 54, 0.3)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <AdminIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.admin}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Administrators
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(33, 150, 243, 0.3)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <TrainerIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.trainer}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Trainers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(255, 152, 0, 0.3)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <InactiveIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.inactive}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Inactive Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Zoom>

      {/* Enhanced Filters */}
      <Fade in timeout={1200}>
        <Paper sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e8e8e8'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <FilterIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
              Search & Filter
            </Typography>
          </Box>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search users"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'primary.main' }} />
                    </InputAdornment>
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
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Role</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="Filter by Role"
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
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="trainer">Trainer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Filter by Status"
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
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* Enhanced Users Table */}
      <Fade in timeout={1400}>
        <Paper sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid #e8e8e8'
        }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '& th': {
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    borderBottom: 'none',
                    padding: '16px 24px'
                  }
                }}>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                          {users.length === 0 ? 'No users found' : 'No users match your search criteria'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {users.length === 0 ? 'Start by creating your first user' : 'Try adjusting your search or filters'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user, index) => (
                    <Fade in timeout={1600 + index * 100} key={user.id}>
                      <TableRow 
                        hover 
                        sx={{ 
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.04)',
                            transform: 'scale(1.01)',
                          },
                          '& td': {
                            borderBottom: '1px solid #f0f0f0',
                            padding: '16px 24px'
                          }
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Badge
                              overlap="circular"
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              badgeContent={
                                <Box sx={{ 
                                  width: 12, 
                                  height: 12, 
                                  borderRadius: '50%',
                                  backgroundColor: user.is_active ? '#4caf50' : '#f44336',
                                  border: '2px solid white'
                                }} />
                              }
                            >
                              <Avatar sx={{ 
                                mr: 3, 
                                bgcolor: user.role === 'admin' ? 'error.main' : 'primary.main',
                                width: 48,
                                height: 48,
                                fontSize: '1.2rem',
                                fontWeight: 600
                              }}>
                                {user.full_name.charAt(0).toUpperCase()}
                              </Avatar>
                            </Badge>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {user.full_name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                @{user.username}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getRoleIcon(user.role)}
                            label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            color={getRoleColor(user.role)}
                            size="medium"
                            variant="filled"
                            sx={{ 
                              fontWeight: 600,
                              '& .MuiChip-icon': {
                                color: 'white'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getStatusIcon(user.is_active)}
                            <Chip
                              label={getStatusText(user.is_active)}
                              color={getStatusColor(user.is_active)}
                              size="small"
                              variant="filled"
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ScheduleIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(user.createdAt), 'HH:mm')}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TrendingUpIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {format(new Date(user.updatedAt), 'MMM dd, yyyy')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(user.updatedAt), 'HH:mm')}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Delete User">
                            <IconButton 
                              onClick={() => handleDeleteClick(user)}
                              sx={{ 
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    </Fade>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Fade>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Success/Error Snackbar */}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 400
          }
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DeleteIcon sx={{ mr: 2, color: 'error.main', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Delete User
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete the user <strong>{userToDelete?.full_name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. The user will be permanently removed from the system.
          </Typography>
          {userToDelete?.role === 'admin' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Warning:</strong> This is an administrator account. Make sure you have other admin users in the system.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleDeleteCancel}
            disabled={deleting}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            disabled={deleting}
            variant="contained"
            color="error"
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
              }
            }}
          >
            {deleting ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListUsers; 