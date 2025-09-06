import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  LinearProgress,
  TextField,
  MenuItem,
  InputAdornment,
  FormControl,
  Select,
  InputLabel,
  Divider,
  Menu,
  ListItemIcon,
  Drawer,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
  DialogContentText,
  Stack,
  Snackbar,
  Alert as MuiAlert,
  Checkbox,
  Avatar,
  ListItemButton,
  ListItemAvatar,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  TableChartOutlined,
  PictureAsPdfOutlined,
  TableChart as TableChartIcon,
  InsertChart as InsertChartIcon,
  Menu as MenuIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Today as TodayIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  GroupWork as GroupWorkIcon,
  PersonAdd as PersonAddIcon,
  MusicNote
} from '@mui/icons-material';
import { format, isPast, parseISO, isAfter, subDays, addDays } from 'date-fns';
import * as XLSX from 'xlsx';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import api from '../services/api';
import StudentsView from './StudentsView';
import BatchesView from './BatchesView';
import CreateUser from './CreateUser';
import ListUsers from './ListUsers';
import VisualizationsView from './VisualizationsView';
import AttendanceView from './AttendanceView';
import DetailedView from './DetailedView';
import MyProfile from './MyProfile';
import Settings from './Settings';
import { useTheme as useThemeContext } from '../contexts/ThemeContext';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const Logo = ({ theme, isDark }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 3,
      px: 2,
      background: theme.palette.background.paper,
      borderBottom: `1px solid ${theme.palette.divider}`,
      textAlign: 'center',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <MusicNote 
        sx={{ 
          fontSize: 32, 
          color: theme.palette.primary.main,
        }} 
      />
      <Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary,
            lineHeight: 1.2,
          }}
        >
          Shadows Dance Studio
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block',
            color: theme.palette.text.secondary,
            fontWeight: 500,
          }}
        >
          Management System
        </Typography>
      </Box>
    </Box>
  </Box>
);

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AddStudentDialog = ({ open, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    batch: '',
    feesMonth: format(new Date(), 'yyyy-MM'),
    amount: '',
    status: 'Unpaid',
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    paymentMode: 'Cash'
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
    try {
      await onAdd(formData);
      onClose();
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 20px 60px rgba(139, 92, 246, 0.2)',
        }
      }}
    >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
          color: 'white',
          fontWeight: 700,
        }}>
          Add New Student
        </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
            <TextField
              fullWidth
                label="Student Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              required
            />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Batch"
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
            <TextField
              fullWidth
                label="Fees Month"
                name="feesMonth"
                type="month"
                value={formData.feesMonth}
                onChange={handleChange}
              required
                InputLabelProps={{ shrink: true }}
            />
            </Grid>
            <Grid item xs={12}>
            <TextField
                fullWidth
                label="Amount"
              name="amount"
              type="number"
                value={formData.amount}
                onChange={handleChange}
                required
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
              name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
            >
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Unpaid">Unpaid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.status === 'Paid' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Payment Date"
                    name="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Mode</InputLabel>
                    <Select
                      name="paymentMode"
                      value={formData.paymentMode}
                      onChange={handleChange}
                      label="Payment Mode"
                    >
                      <MenuItem value="Cash">Cash</MenuItem>
                      <MenuItem value="UPI">UPI</MenuItem>
                      <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                      <MenuItem value="Cheque">Cheque</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: '#8B5CF6',
              color: '#8B5CF6',
              '&:hover': {
                borderColor: '#7C3AED',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            sx={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                transform: 'translateY(-1px)',
              }
            }}
          >
            Add Student
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const EditStudentDialog = React.memo(({ 
  open, 
  onClose, 
  onEdit, 
  student,
  uniqueBatches 
}) => {
  const [formData, setFormData] = useState({
    feesMonth: format(new Date(), 'yyyy-MM'),
    amount: '',
    status: 'Unpaid',
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    paymentMode: 'Cash'
  });

  useEffect(() => {
    if (student) {
      const newFormData = {
        feesMonth: student.feesMonth || format(new Date(), 'yyyy-MM'),
        amount: student.amount ? String(student.amount) : '',
        status: student.status || 'Unpaid',
        paymentDate: student.paymentDate || format(new Date(), 'yyyy-MM-dd'),
        paymentMode: student.paymentMode || 'Cash'
      };
      setFormData(newFormData);
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student?.id) return;

    const updatedData = {
      ...formData,
      amount: Number(formData.amount) || 0,
      paymentDate: formData.status === 'Paid' ? formData.paymentDate : null,
      paymentMode: formData.status === 'Paid' ? formData.paymentMode : null
    };

    try {
      await onEdit(student.id, updatedData);
      onClose();
    } catch (error) {
      console.error('Error updating student fees:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Student Fees</DialogTitle>
      <form onSubmit={handleSubmit}>
    <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Student: {student?.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Batch: {student?.batch?.name || student?.batch || ''}
              </Typography>
            </Grid>
            <Grid item xs={12}>
        <TextField
          fullWidth
          label="Fees Month"
                name="feesMonth"
                type="month"
                value={formData.feesMonth}
                onChange={handleChange}
          required
                InputLabelProps={{ shrink: true }}
        />
            </Grid>
            <Grid item xs={12}>
        <TextField
                fullWidth
                label="Amount"
          name="amount"
          type="number"
                value={formData.amount}
                onChange={handleChange}
                required
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
          }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
          name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
        >
          <MenuItem value="Paid">Paid</MenuItem>
          <MenuItem value="Unpaid">Unpaid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.status === 'Paid' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Payment Date"
                    name="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Mode</InputLabel>
                    <Select
                      name="paymentMode"
                      value={formData.paymentMode}
                      onChange={handleChange}
                      label="Payment Mode"
                    >
                      <MenuItem value="Cash">Cash</MenuItem>
                      <MenuItem value="UPI">UPI</MenuItem>
                      <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                      <MenuItem value="Cheque">Cheque</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Update Fees
      </Button>
    </DialogActions>
      </form>
  </Dialog>
  );
});

// Utility to check for valid date string
function isValidDateString(date) {
  return date && !isNaN(new Date(date));
}







const FeesDashboard = ({ initialTab }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isDark } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Add user role state
  const [userRole] = useState(localStorage.getItem('userRole') || 'admin');
  const [userName] = useState(localStorage.getItem('userName') || 'Admin User');
  
  // Set initial tab based on role and initialTab prop
  const getInitialTab = () => {
    if (userRole === 'trainer') return 2;
    if (initialTab === 'attendance') return 2;
    if (initialTab === 'visualizations') return 1;
    return 1; // Default to visualizations tab
  };
  
  const [selectedTab, setSelectedTab] = useState(getInitialTab());
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

  // Function to handle tab switching with data refresh
  const handleTabSwitch = async (newTab) => {
    setSelectedTab(newTab);
    
    // Refresh data when switching to Detailed View (tab 0) or Visualizations (tab 1)
    if (newTab === 0 || newTab === 1) {
      try {
        setLoading(true);
    
        
        // Fetch fresh students data
        const data = await api.getStudents();
        
        setStudents(data);
        
        // Fetch fresh batches data
        const batches = await api.getBatches();
        
        setAllBatches(batches);
        
        // Fetch fresh attendance data for current date
        const today = format(new Date(), 'yyyy-MM-dd');
                  const attendance = await api.getAttendance(today, 'all');
        
        // Initialize attendance map with 'absent' for all students
        const attendanceMap = {};
        data.forEach(student => {
          attendanceMap[student.id] = 'absent';
        });
        
        // Update with actual attendance data if available
        if (attendance && attendance.length > 0) {
          attendance.forEach(record => {
            attendanceMap[record.studentId] = record.status;
          });
        }
        
        setAttendanceData({ [today]: attendanceMap });
        setError(null);
      } catch (err) {
        console.error('Error refreshing data:', err);
        setError('Failed to refresh data');
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch students and attendance data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
  
        
        // Fetch students data
        const data = await api.getStudents();
        
        setStudents(data);
        
        // Fetch attendance data for current date
        const today = format(new Date(), 'yyyy-MM-dd');
                  const attendance = await api.getAttendance(today, 'all');
        
        // Initialize attendance map with 'absent' for all students
        const attendanceMap = {};
        data.forEach(student => {
          attendanceMap[student.id] = 'absent';
        });
        
        // Update with actual attendance data if available
        if (attendance && attendance.length > 0) {
          attendance.forEach(record => {
            attendanceMap[record.studentId] = record.status;
          });
        }
        
        setAttendanceData({ [today]: attendanceMap });
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Remove openReminder state

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  const [orderBy, setOrderBy] = useState('feesMonth');
  const [order, setOrder] = useState('desc');
  const [selectedTimeRange, setSelectedTimeRange] = useState('3');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const [openCreateUserDialog, setOpenCreateUserDialog] = useState(false);
  const [openListUsersDialog, setOpenListUsersDialog] = useState(false);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [profileFromSettings, setProfileFromSettings] = useState(false);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const sessionTimeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);

  // Session timeout constants
  const SESSION_TIMEOUT_DURATION = 2 * 60 * 60 * 1000; // 2 hours
  const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes warning

  // Filter and sort students for visualization view
  const filteredStudents = useMemo(() => {
    let filtered = [...students];
    
    if (selectedBatch !== 'all') {
      filtered = filtered.filter(student => 
        (student.batch?.name || student.batch) === selectedBatch
      );
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(student => student.status === selectedStatus);
    }

    if (selectedMonth !== 'all') {
      filtered = filtered.filter(student => {
        const studentMonth = format(parseISO(student.feesMonth), 'MMMM yyyy');
        return studentMonth === selectedMonth;
      });
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(query)
      );
    }
    
    filtered.sort((a, b) => {
      let compareResult = 0;
      
      if (orderBy === 'feesMonth') {
        compareResult = isAfter(parseISO(a.feesMonth), parseISO(b.feesMonth)) ? -1 : 1;
      } else {
        const dateCompare = isAfter(parseISO(a.feesMonth), parseISO(b.feesMonth)) ? -1 : 1;
        
        let fieldCompare = 0;
        if (orderBy === 'name') {
          fieldCompare = a.name.localeCompare(b.name);
        } else if (orderBy === 'batch') {
          const batchA = a.batch?.name || a.batch || '';
          const batchB = b.batch?.name || b.batch || '';
          fieldCompare = batchA.localeCompare(batchB);
        } else if (orderBy === 'amount') {
          fieldCompare = a.amount - b.amount;
        } else if (orderBy === 'status') {
          fieldCompare = a.status.localeCompare(b.status);
        }
        
        compareResult = fieldCompare || dateCompare;
      }
      
      return order === 'desc' ? compareResult : -compareResult;
    });
    
    return filtered;
  }, [students, searchQuery, selectedBatch, selectedStatus, selectedMonth, orderBy, order]);

  // Session timeout effect - Simplified version
  useEffect(() => {
    // Check if user is authenticated before setting up session timeout
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    
    if (!isAuthenticated || !userRole || !userName) {
      return;
    }

    // Pause session timeout when user management dialogs are open
    if (openCreateUserDialog || openListUsersDialog) {
      return;
    }

    
    
    const handleSessionTimeout = () => {
      const currentAuth = localStorage.getItem('isAuthenticated') === 'true';
      if (!currentAuth) {
        return;
      }
      
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      navigate('/');
      setSnackbar({
        open: true,
        message: 'Session expired. Please log in again.',
        severity: 'warning'
      });
    };

    const resetSessionTimeout = () => {
      // Clear existing timeouts
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      
      // Set warning timeout
      warningTimeoutRef.current = setTimeout(() => {
        const currentAuth = localStorage.getItem('isAuthenticated') === 'true';
        if (currentAuth) {
          setShowSessionWarning(true);
        }
      }, SESSION_TIMEOUT_DURATION - SESSION_WARNING_TIME);

      // Set session timeout
      sessionTimeoutRef.current = setTimeout(() => {
        handleSessionTimeout();
      }, SESSION_TIMEOUT_DURATION);
    };

    const handleUserActivity = () => {
      const currentAuth = localStorage.getItem('isAuthenticated') === 'true';
      if (!currentAuth) {
        return;
      }
      
      resetSessionTimeout();
      setShowSessionWarning(false);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    // Initialize timeout
    resetSessionTimeout();

    return () => {
      // Cleanup timeouts
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      // Remove event listeners
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [navigate, openCreateUserDialog, openListUsersDialog]);

  // Handlers for student management
  const handleAddStudent = async (studentData) => {
    try {
  
      
      // Add the student and get the created student with ID
      const createdStudent = await api.addStudent(studentData);
      
      
      const updatedStudents = await api.getStudents();
      setStudents(updatedStudents);
      
      // Automatically create fee records for the new student for the past 12 months
      const currentDate = new Date();
      
      
      for (let i = 0; i < 12; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthStr = format(date, 'yyyy-MM-dd'); // Use full date format
        
        const feeData = {
          studentId: createdStudent.id, // Use the ID from the created student
          feesMonth: monthStr,
          amount: 0,
          status: 'Unpaid',
          paymentDate: null,
          paymentMode: null
        };
        
                  try {
            await api.addFee(feeData);
          } catch (feeError) {
            console.error(`Error creating fee record ${i + 1}:`, feeError);
            // Continue with other fee records even if one fails
          }
      }
      
      
      
      // Refresh fees data
      await fetchFees();
      
      
      setSnackbar({ open: true, message: 'Student added successfully with fee records', severity: 'success' });
    } catch (error) {
      console.error('Error adding student:', error);
      console.error('Error response:', error.response?.data);
      setSnackbar({ open: true, message: 'Failed to add student', severity: 'error' });
    }
  };

  const handleUpdateStudent = async (studentId, formData) => {
    try {
      const updatedFeeData = {
        feesMonth: formData.feesMonth,
        amount: Number(formData.amount) || 0,
        status: formData.status,
        paymentDate: formData.status === 'Paid' ? formData.paymentDate : null,
        paymentMode: formData.status === 'Paid' ? formData.paymentMode : null
      };

      await api.updateFees(studentId, updatedFeeData);
      const updatedStudents = await api.getStudents();
      setStudents(updatedStudents);
      setSelectedStudent(null);
      setSnackbar({ open: true, message: 'Fee details updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error updating fee details:', error);
      setSnackbar({ open: true, message: 'Failed to update fee details', severity: 'error' });
      throw error;
    }
  };



  const handleMarkAsPaid = async (fee) => {
    try {
      const updatedFeeData = {
        feesMonth: fee.feesMonth,
        amount: fee.amount,
        status: 'Paid',
        paymentDate: format(new Date(), 'yyyy-MM-dd'),
        paymentMode: 'Cash'
      };
      
      await api.updateFees(fee.studentId, updatedFeeData);
      // Refresh students data
      const updatedStudents = await api.getStudents();
      setStudents(updatedStudents);
      setSnackbar({ open: true, message: 'Fee marked as paid successfully', severity: 'success' });
    } catch (error) {
      console.error('Error marking fee as paid:', error);
      setSnackbar({ open: true, message: 'Failed to mark fee as paid', severity: 'error' });
    }
  };

  const handleDeleteStudent = async (student) => {
    try {
      await api.deleteStudent(student.id);
      // Refresh students data
      const updatedStudents = await api.getStudents();
      setStudents(updatedStudents);
      setSnackbar({ open: true, message: 'Student deleted successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete student', severity: 'error' });
    }
  };

  // Utility functions
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Derived data
  const [allBatches, setAllBatches] = useState([]);
  const [fees, setFees] = useState([]);
  
  // Fetch all batches from database
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const batches = await api.getBatches();
        setAllBatches(batches);
      } catch (error) {
        console.error('Error fetching batches:', error);
      }
    };
    fetchBatches();
  }, []);

  // Fetch fees data
  const fetchFees = useCallback(async () => {
    try {
      const data = await api.getFees();
      setFees(data || []);
    } catch (err) {
      console.error('Error fetching fees:', err);
      // Set empty array on error to prevent infinite loading
      setFees([]);
    }
  }, []);

  // Initial fetch of fees
  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const uniqueBatches = useMemo(() => {
    // Get batches from students (for backward compatibility)
    const studentBatches = Array.from(new Set(students.map(student => student.batch?.name || student.batch))).filter(Boolean);
    
    // Get all batches from database
    const allBatchNames = allBatches.map(batch => batch.name || batch);
    
    // Combine and remove duplicates
    const combinedBatches = [...new Set([...studentBatches, ...allBatchNames])];
    
    return combinedBatches.sort();
  }, [students, allBatches]);


  const batchSummary = useMemo(() => {
    return uniqueBatches.map(batch => {
      const batchStudents = students.filter(s => s.batch === batch);
      const totalAmount = batchStudents.reduce((sum, s) => sum + s.amount, 0);
      const paidAmount = batchStudents
        .filter(s => s.status === 'Paid')
        .reduce((sum, s) => sum + s.amount, 0);
      
      return {
        batch,
        totalStudents: batchStudents.length,
        feesCollected: paidAmount,
        pendingAmount: totalAmount - paidAmount,
        collectionRate: (paidAmount / totalAmount) * 100 || 0
      };
    });
  }, [students, uniqueBatches]);

  const drawerWidth = 240;

  const drawer = (
    <Box sx={{ 
      overflow: 'auto',
      background: theme.palette.background.paper,
      height: '100%'
    }}>
      <Logo theme={theme} isDark={isDark} />
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        {userRole === 'admin' && (
          <>
            <ListItem 
              button 
              selected={selectedTab === 0} 
              onClick={() => handleTabSwitch(0)}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.contrastText,
                  },
                },
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F3F4F6',
                },
              }}
            >
              <ListItemIcon>
                <TableChartIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Detailed View" 
                primaryTypographyProps={{ fontWeight: selectedTab === 0 ? 600 : 500 }}
              />
            </ListItem>
            <ListItem 
              button 
              selected={selectedTab === 1} 
              onClick={() => handleTabSwitch(1)}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.contrastText,
                  },
                },
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F3F4F6',
                },
              }}
            >
              <ListItemIcon>
                <InsertChartIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Visualizations" 
                primaryTypographyProps={{ fontWeight: selectedTab === 1 ? 600 : 500 }}
              />
            </ListItem>
            <ListItem 
              button 
              selected={selectedTab === 3} 
              onClick={() => handleTabSwitch(3)}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.contrastText,
                  },
                },
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F3F4F6',
                },
              }}
            >
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Students" 
                primaryTypographyProps={{ fontWeight: selectedTab === 3 ? 600 : 500 }}
              />
            </ListItem>
            <ListItem 
              button 
              selected={selectedTab === 4} 
              onClick={() => handleTabSwitch(4)}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.contrastText,
                  },
                },
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F3F4F6',
                },
              }}
            >
              <ListItemIcon>
                <GroupWorkIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Batches" 
                primaryTypographyProps={{ fontWeight: selectedTab === 4 ? 600 : 500 }}
              />
            </ListItem>
          </>
        )}
        <ListItem 
          button 
          selected={selectedTab === 2} 
          onClick={() => handleTabSwitch(2)}
          sx={{
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
            '&.Mui-selected': {
              backgroundColor: '#6366F1',
              color: 'white',
              '&:hover': {
                backgroundColor: '#4F46E5',
              },
              '& .MuiListItemIcon-root': {
                color: 'white',
              },
            },
            '&:hover': {
              backgroundColor: '#F3F4F6',
            },
          }}
        >
          <ListItemIcon>
            <TodayIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Attendance" 
            primaryTypographyProps={{ fontWeight: selectedTab === 2 ? 600 : 500 }}
          />
        </ListItem>
      </List>
    </Box>
  );

  const mainContent = () => {
    if (loading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          background: isDark ? 'transparent' : '#F9FAFB',
        }}>
          <Box sx={{ 
            backgroundColor: '#6366F1',
            borderRadius: '50%',
            p: 3,
            mb: 2,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          }}>
            <CircularProgress sx={{ color: 'white' }} size={40} />
          </Box>
          <Typography variant="h6" sx={{ color: '#6B7280', fontWeight: 500 }}>
            Loading your data...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ 
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100%',
          background: isDark ? 'transparent' : '#F9FAFB',
        }}>
          <Card sx={{ 
            maxWidth: 400,
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            </CardContent>
          </Card>
        </Box>
      );
    }

    switch(selectedTab) {
      case 0:
        return (
          <Box sx={{ 
            p: 3,
            background: isDark ? 'transparent' : '#F9FAFB',
            minHeight: '100%'
          }}>
            <DetailedView 
              students={students}
              allBatches={allBatches}
              feesData={fees}
              fetchFees={fetchFees}
              onEdit={(fee) => {
                setSelectedStudent(fee);
                setOpenEditDialog(true);
              }}
              onMarkAsPaid={handleMarkAsPaid}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ 
            p: 3,
            background: isDark ? 'transparent' : '#F9FAFB',
            minHeight: '100%'
          }}>
            <VisualizationsView 
              filteredStudents={filteredStudents}
              students={students}
              batchSummary={batchSummary}
              selectedTimeRange={selectedTimeRange}
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ 
            p: 3,
            background: isDark ? 'transparent' : '#F9FAFB',
            minHeight: '100%'
          }}>
            <AttendanceView 
              students={students} 
              uniqueBatches={uniqueBatches} 
              batchSummary={batchSummary}
              attendanceData={attendanceData}
              setAttendanceData={setAttendanceData}
              isLoadingAttendance={isLoadingAttendance}
              setIsLoadingAttendance={setIsLoadingAttendance}
              allBatches={allBatches}
            />
          </Box>
        );
      case 3:
        return (
          <Box sx={{ 
            p: 3,
            background: isDark ? 'transparent' : '#F9FAFB',
            minHeight: '100%'
          }}>
            <StudentsView onAddStudent={handleAddStudent} />
          </Box>
        );
      case 4:
        return (
          <Box sx={{ 
            p: 3,
            background: isDark ? 'transparent' : '#F9FAFB',
            minHeight: '100%'
          }}>
            <BatchesView />
          </Box>
        );
      default:
        return (
          <Box sx={{ 
            p: 3,
            background: isDark ? 'transparent' : '#F9FAFB',
            minHeight: '100%'
          }}>
            <DetailedView allBatches={allBatches} feesData={fees} fetchFees={fetchFees} setSnackbar={setSnackbar} />
          </Box>
        );
    }
  };

  const handleProfileClick = (event) => {
    setAnchorElProfile(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorElProfile(null);
  };

  const handleLogoutClick = () => {
    handleProfileClose();
    setOpenLogoutDialog(true);
  };

  const handleLogoutCancel = () => {
    setOpenLogoutDialog(false);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    navigate('/');
    setSnackbar({ open: true, message: 'Logged out successfully!', severity: 'success' });
  };

  const handleExtendSession = () => {
    setShowSessionWarning(false);
    // Reset the session timeout using the same logic as the main effect
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    
    // Set warning timeout
    warningTimeoutRef.current = setTimeout(() => {
      setShowSessionWarning(true);
    }, SESSION_TIMEOUT_DURATION - SESSION_WARNING_TIME);

    // Set session timeout
    sessionTimeoutRef.current = setTimeout(() => {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      navigate('/');
      setSnackbar({
        open: true,
        message: 'Session expired. Please log in again.',
        severity: 'warning'
      });
    }, SESSION_TIMEOUT_DURATION);
  };

  const handleLogoutNow = () => {
    setShowSessionWarning(false);
    handleLogoutConfirm();
  };

  const handleCreateUserClick = () => {
    handleProfileClose();
    setOpenCreateUserDialog(true);
  };

  const handleListUsersClick = () => {
    handleProfileClose();
    setOpenListUsersDialog(true);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              {userRole === 'trainer' ? 'Attendance Management' : 
                selectedTab === 0 ? 'Detailed View' : 
                selectedTab === 1 ? 'Visualizations' : 'Attendance'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              onClick={handleProfileClick}
            >
              <Avatar sx={{ bgcolor: 'primary.dark' }}>
                {userName.charAt(0)}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Add Profile Menu */}
      <Menu
        anchorEl={anchorElProfile}
        open={Boolean(anchorElProfile)}
        onClose={handleProfileClose}
        onClick={handleProfileClose}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'primary.dark' }}>
              {userName.charAt(0)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={userName}
            secondary={userRole === 'admin' ? 'Administrator' : 'Trainer'}
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          setAnchorElProfile(null);
          setOpenProfileDialog(true);
        }}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="My Profile" />
        </MenuItem>
        <MenuItem onClick={() => {
          setAnchorElProfile(null);
          setOpenSettingsDialog(true);
        }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        {userRole === 'admin' && (
          <>
            <Divider />
            <MenuItem onClick={handleCreateUserClick}>
              <ListItemIcon>
                <PersonAddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Create User" />
            </MenuItem>
            <MenuItem onClick={handleListUsersClick}>
              <ListItemIcon>
                <PeopleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="List Users" />
            </MenuItem>
          </>
        )}
        <Divider />
        <MenuItem onClick={handleLogoutClick}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          height: 'calc(100vh - 64px)',
          overflow: 'auto',
          background: isDark ? 'transparent' : '#F9FAFB',
        }}
      >
        {mainContent()}
      </Box>

      <AddStudentDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onAdd={handleAddStudent}
      />

      <EditStudentDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        onEdit={handleUpdateStudent}
        student={selectedStudent}
        uniqueBatches={uniqueBatches}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>

      <Dialog
        open={openLogoutDialog}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: theme.palette.background.paper,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 20px 60px rgba(0, 0, 0, 0.4)'
              : '0 20px 60px rgba(139, 92, 246, 0.2)',
          }
        }}
      >
        <DialogTitle id="logout-dialog-title" sx={{ 
          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          color: 'white',
          fontWeight: 700,
        }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <DialogContentText id="logout-dialog-description" sx={{ color: theme.palette.text.secondary }}>
            Are you sure you want to log out? Any unsaved changes will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleLogoutCancel}
            variant="outlined"
            sx={{
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                borderColor: theme.palette.primary.dark,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(139, 92, 246, 0.2)'
                  : 'rgba(139, 92, 246, 0.1)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLogoutConfirm} 
            variant="contained" 
            sx={{
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                background: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled,
                transform: 'none',
              }
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showSessionWarning}
        aria-labelledby="session-warning-dialog-title"
        aria-describedby="session-warning-dialog-description"
      >
        <DialogTitle id="session-warning-dialog-title">
          Session Timeout Warning
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="session-warning-dialog-description">
            Your session will expire in 5 minutes due to inactivity. Would you like to extend your session?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutNow} color="error">
            Logout Now
          </Button>
          <Button onClick={handleExtendSession} color="primary" variant="contained">
            Extend Session
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog
        open={openCreateUserDialog}
        onClose={() => setOpenCreateUserDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <CreateUser 
            onClose={() => setOpenCreateUserDialog(false)}
            onSuccess={() => setOpenCreateUserDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* List Users Dialog */}
      <Dialog
        open={openListUsersDialog}
        onClose={() => setOpenListUsersDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <ListUsers 
            onClose={() => setOpenListUsersDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* My Profile Dialog */}
      <MyProfile
        open={openProfileDialog}
        onClose={() => {
          setOpenProfileDialog(false);
          setProfileFromSettings(false);
        }}
        fromSettings={profileFromSettings}
        onBackToSettings={() => {
          setOpenProfileDialog(false);
          setOpenSettingsDialog(true);
        }}
      />

      {/* Settings Dialog */}
      <Settings
        open={openSettingsDialog}
        onClose={() => setOpenSettingsDialog(false)}
        onOpenProfile={(fromSettings = false) => {
          setProfileFromSettings(fromSettings);
          setOpenProfileDialog(true);
        }}
      />
    </Box>
  );
};

export default FeesDashboard; 