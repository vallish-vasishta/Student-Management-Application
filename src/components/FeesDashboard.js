import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
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
  Container,
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
  Tabs,
  Tab,
  IconButton,
  useTheme,
  useMediaQuery,
  styled,
  DialogContentText,
  Fab,
  Stack,
  Snackbar,
  Alert as MuiAlert,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  Checkbox,
  FormControlLabel,
  Switch,
  Avatar,
  Popover,
  ListItemButton,
  ListItemAvatar,
  CircularProgress
} from '@mui/material';
import {
  PaidOutlined,
  GroupOutlined,
  WarningAmberOutlined,
  TrendingUpOutlined,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  FileDownload as FileDownloadIcon,
  TableChartOutlined,
  PictureAsPdfOutlined,
  InsertDriveFileOutlined,
  TableChart as TableChartIcon,
  InsertChart as InsertChartIcon,
  Menu as MenuIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  CalendarToday as CalendarIcon,
  PersonOutline as PersonIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Today as TodayIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Download as DownloadIcon,
  Class as ClassIcon,
  Assessment as AssessmentIcon,
  EventNote as EventNoteIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  GroupWork as GroupWorkIcon,
  Pencil as PencilIcon,
  Trash as TrashIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { format, isPast, parseISO, isAfter, isBefore, subDays, addDays, startOfMonth } from 'date-fns';
import { utils as xlsxUtils, writeFile } from 'xlsx';
import * as XLSX from 'xlsx';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
          backgroundColor: `${color}15`,
          borderRadius: '50%',
          p: 1,
          mr: 2
        }}>
          {icon}
        </Box>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const BatchSummaryCard = ({ batchData }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Batch {batchData.batch}
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Total Students: {batchData.totalStudents}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fees Collected: {formatCurrency(batchData.feesCollected)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Pending Amount: {formatCurrency(batchData.pendingAmount)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Box sx={{ flex: 1, mr: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={batchData.collectionRate} 
              sx={{ height: 8, borderRadius: 5 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {Math.round(batchData.collectionRate)}%
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ flexGrow: 1 }}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const LogoContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '120px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#fff',
  '& img': {
    height: '100%',
    maxWidth: '100%',
    objectFit: 'contain'
  }
}));

const Logo = () => (
  <LogoContainer>
    <img 
      src="/logo.png" 
      alt="Shadows Dance Studio" 
      style={{ maxHeight: '100px' }}
    />
  </LogoContainer>
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Student</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
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
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
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

const AttendanceView = React.memo(({ students, uniqueBatches, batchSummary, attendanceData, setAttendanceData, isLoadingAttendance, setIsLoadingAttendance }) => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [showingDate, setShowingDate] = useState(format(new Date(), 'MMMM dd, yyyy'));
  const [viewMode, setViewMode] = useState('daily');
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [showLateAttendance, setShowLateAttendance] = useState(false);

  // Add isLateAttendance check
  const isLateAttendance = useMemo(() => {
    const currentTime = new Date();
    return currentTime.getHours() >= 12;
  }, []);

  // Add getBatches function
  const getBatches = useCallback(() => {
    return uniqueBatches;
  }, [uniqueBatches]);

  // Memoize fetchAttendance function
  const fetchAttendance = useCallback(async (date, batch) => {
    if (!date) return;
    
    setIsLoadingAttendance(true);
    try {
      console.log('Fetching attendance for:', { date, batch });
      const data = await api.getAttendance(date, batch);
      console.log('Fetched attendance data:', data);
      
      const attendanceMap = {};
      data.forEach(record => {
        attendanceMap[record.studentId] = record.status;
      });
      
      setAttendanceData(prev => ({
        ...prev,
        [date]: attendanceMap
      }));
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch attendance data',
        severity: 'error'
      });
    } finally {
      setIsLoadingAttendance(false);
    }
  }, [setAttendanceData, setIsLoadingAttendance]);

  // Memoize handleAttendanceChange function
  const handleAttendanceChange = useCallback(async (studentId, status) => {
    console.log('handleAttendanceChange called with:', { studentId, status, selectedDate, selectedBatch });
    
    if (!selectedDate) {
      console.log('Invalid selection:', { selectedDate });
      return;
    }

    setIsLoadingAttendance(true);
    try {
      const records = [{
        studentId,
        status,
        batch: students.find(s => s.id === studentId)?.batch || selectedBatch
      }];

      console.log('Making API call to mark attendance with records:', records);
      const response = await api.markAttendance(selectedDate, records);
      console.log('API response:', response);
      
      // Update local state after successful API call
      setAttendanceData(prev => ({
        ...prev,
        [selectedDate]: {
          ...prev[selectedDate],
          [studentId]: status
        }
      }));

      setSnackbar({
        open: true,
        message: 'Attendance marked successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
      setSnackbar({
        open: true,
        message: 'Failed to mark attendance',
        severity: 'error'
      });
    } finally {
      setIsLoadingAttendance(false);
    }
  }, [selectedDate, selectedBatch, students, setAttendanceData, setIsLoadingAttendance]);

  // Memoize handleDateChange function
  const handleDateChange = useCallback((event) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
    setShowingDate(isValidDateString(newDate) ? format(new Date(newDate), 'MMMM dd, yyyy') : 'Invalid date');
  }, []);

  // Memoize handleBatchChange function
  const handleBatchChange = useCallback((event) => {
    const newBatch = event.target.value;
    setSelectedBatch(newBatch);
  }, []);

  // Fetch attendance data when date changes
  useEffect(() => {
    fetchAttendance(selectedDate, 'all');
  }, [selectedDate, fetchAttendance]);

  const getAttendanceStats = (date = selectedDate, batch = selectedBatch) => {
    if (!date) {
      return { total: 0, present: 0, absent: 0, percentage: 0 };
    }

    const currentDateAttendance = attendanceData[date] || {};
    const filteredStudents = students.filter(s => 
      selectedBatch === 'all' || s.batch === batch
    );
    
    const total = filteredStudents.length;
    const present = filteredStudents.filter(s => 
      currentDateAttendance[s.id] === 'present'
    ).length;
    
    return {
      total,
      present,
      absent: total - present,
      percentage: total ? Math.round((present / total) * 100) : 0
    };
  };

  const stats = getAttendanceStats();

  const filteredStudents = students.filter(student => 
    selectedBatch === 'all' ||
    (student.batch?.name || student.batch) === selectedBatch
  );

  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const exportToExcel = () => {
    handleExportClose();
    const workbook = xlsxUtils.book_new();
    
    // Create worksheet for student data
    const studentData = filteredStudents.map(student => ({
      'Name': student.name,
      'Batch': student.batch,
      'Fees Month': format(parseISO(student.feesMonth), 'MMMM yyyy'),
      'Amount': student.amount,
      'Status': student.status
    }));
    const ws = xlsxUtils.json_to_sheet(studentData);
    xlsxUtils.book_append_sheet(workbook, ws, 'Students');

    // Create worksheet for batch summary
    const batchData = batchSummary.map(batch => ({
      'Batch': batch.batch,
      'Total Students': batch.totalStudents,
      'Fees Collected': batch.feesCollected,
      'Pending Amount': batch.pendingAmount,
      'Collection Rate': `${batch.collectionRate}%`
    }));
    const batchWs = xlsxUtils.json_to_sheet(batchData);
    xlsxUtils.book_append_sheet(workbook, batchWs, 'Batch Summary');

    // Save the file
    xlsxUtils.writeFile(workbook, 'fees_report.xlsx');
    setSnackbar({ open: true, message: 'Report exported to Excel successfully', severity: 'success' });
  };

  const exportToPDF = () => {
    handleExportClose();
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Fees Collection Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on ${format(new Date(), 'PPP')}`, 14, 30);

    // Add batch summary
    doc.setFontSize(14);
    doc.text('Batch Summary', 14, 45);
    
    const batchData = batchSummary.map(batch => [
      batch.batch,
      batch.totalStudents.toString(),
      formatCurrency(batch.feesCollected),
      formatCurrency(batch.pendingAmount),
      `${batch.collectionRate}%`
    ]);

    doc.autoTable({
      startY: 50,
      head: [['Batch', 'Total Students', 'Collected', 'Pending', 'Collection Rate']],
      body: batchData,
      theme: 'grid',
      headStyles: { fillColor: [25, 118, 210] }
    });

    // Add student details
    doc.setFontSize(14);
    doc.text('Student Details', 14, doc.autoTable.previous.finalY + 15);

    const studentData = filteredStudents.map(student => [
      student.name,
      student.batch,
      format(parseISO(student.feesMonth), 'MMM yyyy'),
      formatCurrency(student.amount),
      student.status
    ]);

    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 20,
      head: [['Name', 'Batch', 'Month', 'Amount', 'Status']],
      body: studentData,
      theme: 'grid',
      headStyles: { fillColor: [25, 118, 210] }
    });

    // Save the PDF
    doc.save('fees_report.pdf');
    setSnackbar({ open: true, message: 'Report exported to PDF successfully', severity: 'success' });
  };

  const getAttendanceHistory = () => {
    const history = [];
    let currentDate = parseISO(dateRange.start);
    
    while (!isAfter(currentDate, parseISO(dateRange.end))) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const dayData = attendanceData[dateStr] || {};
      
      const filteredStudents = students.filter(s => 
        selectedBatch === 'all' || s.batch === selectedBatch
      );
      
      const total = filteredStudents.length;
      const present = filteredStudents.filter(s => 
        dayData[s.id] === 'present'
      ).length;
      
      history.push({
        date: dateStr,
        total,
        present,
        absent: total - present,
        percentage: total ? Math.round((present / total) * 100) : 0
      });
      
      currentDate = addDays(currentDate, 1);
    }
    
    return history;
  };

  const handleBulkAttendance = async (status) => {
    if (!selectedDate) {
      console.log('Invalid selection:', { selectedDate });
      return;
    }

    if (selectedStudents.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one student',
        severity: 'warning'
      });
      return;
    }

    setIsLoadingAttendance(true);
    try {
      const records = selectedStudents.map(studentId => {
        const student = students.find(s => s.id === studentId);
        return {
          studentId,
          status,
          batch: student?.batch || selectedBatch
        };
      });

      console.log('Making bulk API call to mark attendance with records:', records);
      const response = await api.markAttendance(selectedDate, records);
      console.log('Bulk API response:', response);
      
      // Update local state after successful API call
      setAttendanceData(prev => ({
        ...prev,
        [selectedDate]: {
          ...prev[selectedDate],
          ...Object.fromEntries(selectedStudents.map(id => [id, status]))
        }
      }));

      setSelectedStudents([]);
      setSnackbar({
        open: true,
        message: `Marked ${selectedStudents.length} students as ${status}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error marking bulk attendance:', error);
      setSnackbar({
        open: true,
        message: 'Failed to mark attendance',
        severity: 'error'
      });
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      }
      return [...prev, studentId];
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = filteredStudents.map(student => student.id);
      setSelectedStudents(allIds);
    } else {
      setSelectedStudents([]);
    }
  };

  const getStudentAttendanceRate = (studentId) => {
    const history = getAttendanceHistory();
    const studentAttendance = history.filter(day => 
      attendanceData[day.date]?.[studentId] === 'present'
    );
    return Math.round((studentAttendance.length / history.length) * 100);
  };

  const DailyView = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Batch</InputLabel>
          <Select
            value={selectedBatch}
            label="Batch"
            onChange={handleBatchChange}
            disabled={isLoadingAttendance}
          >
            <MenuItem value="all">All Batches</MenuItem>
            {getBatches().map((batch) => (
              <MenuItem key={batch} value={batch}>
                {batch}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          disabled={isLoadingAttendance}
          InputLabelProps={{ shrink: true }}
        />

        {isLoadingAttendance && (
          <CircularProgress size={24} />
        )}
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  {showingDate}
                  {isLateAttendance && showLateAttendance && (
                    <Chip
                      size="small"
                      color="warning"
                      label="Late Attendance"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Selected Date
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  {stats.total}
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Total Students
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={stats.percentage}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PresentIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6" component="div">
                  {stats.present}
                  <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                    ({Math.round((stats.present / stats.total) * 100)}%)
                  </Typography>
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Present
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AbsentIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6" component="div">
                  {stats.absent}
                  <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                    ({Math.round((stats.absent / stats.total) * 100)}%)
                  </Typography>
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Absent
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {selectedStudents.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography>
                {selectedStudents.length} students selected
              </Typography>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleBulkAttendance('present')}
                startIcon={<CheckCircleIcon />}
              >
                Mark Present
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleBulkAttendance('absent')}
                startIcon={<AbsentIcon />}
              >
                Mark Absent
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedStudents.length > 0 && 
                    selectedStudents.length < filteredStudents.length
                  }
                  checked={
                    filteredStudents.length > 0 && 
                    selectedStudents.length === filteredStudents.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Batch</TableCell>
              <TableCell align="center">Attendance</TableCell>
              <TableCell align="right">Attendance Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student) => {
              const attendanceRate = getStudentAttendanceRate(student.id);
              return (
                <TableRow 
                  key={student.id}
                  selected={selectedStudents.includes(student.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                    />
                  </TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.batch?.name || student.batch || ''}</TableCell>
                  <TableCell align="center">
                    <ToggleButtonGroup
                      value={attendanceData[selectedDate]?.[student.id] || 'absent'}
                      exclusive
                      onChange={(e, newValue) => {
                        if (newValue !== null) {
                          handleAttendanceChange(student.id, newValue);
                        }
                      }}
                      size="small"
                      disabled={isLoadingAttendance}
                    >
                      <ToggleButton 
                        value="present" 
                        sx={{ 
                          '&.Mui-selected': { 
                            backgroundColor: 'success.light',
                            color: 'success.contrastText',
                            '&:hover': { backgroundColor: 'success.main' }
                          }
                        }}
                      >
                        Present
                      </ToggleButton>
                      <ToggleButton 
                        value="absent"
                        sx={{ 
                          '&.Mui-selected': { 
                            backgroundColor: 'error.light',
                            color: 'error.contrastText',
                            '&:hover': { backgroundColor: 'error.main' }
                          }
                        }}
                      >
                        Absent
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {attendanceRate}%
                      </Typography>
                      <Box sx={{ width: 100 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={attendanceRate}
                          color={attendanceRate >= 75 ? 'success' : attendanceRate >= 50 ? 'warning' : 'error'}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No students found matching your search criteria
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const HistoryView = () => (
    <>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Attendance Trends
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getAttendanceHistory()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
                    />
                    <YAxis />
                    <RechartsTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
                              <p>{format(parseISO(label), 'MMMM dd, yyyy')}</p>
                              {payload.map((entry, index) => (
                                <p key={index} style={{ color: entry.color }}>
                                  {entry.name}: {entry.value}%
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="present" 
                      name="Present" 
                      stroke="#4caf50" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="absent" 
                      name="Absent" 
                      stroke="#f44336" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="percentage" 
                      name="Attendance %" 
                      stroke="#2196f3" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Date Range
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Batch-wise Summary
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Batch</TableCell>
                  <TableCell align="right">Total Students</TableCell>
                  <TableCell align="right">Avg. Attendance</TableCell>
                  <TableCell align="right">Highest</TableCell>
                  <TableCell align="right">Lowest</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {uniqueBatches.map(batch => {
                  const batchStats = getAttendanceHistory()
                    .map(day => ({
                      ...day,
                      stats: getAttendanceStats(day.date, batch)
                    }));
                  
                  const avgAttendance = Math.round(
                    batchStats.reduce((sum, day) => sum + day.stats.percentage, 0) / 
                    batchStats.length
                  );
                  
                  const highest = Math.max(...batchStats.map(day => day.stats.percentage));
                  const lowest = Math.min(...batchStats.map(day => day.stats.percentage));
                  
                  return (
                    <TableRow key={batch}>
                      <TableCell>Batch {batch}</TableCell>
                      <TableCell align="right">
                        {students.filter(s => s.batch === batch).length}
                      </TableCell>
                      <TableCell align="right">{avgAttendance}%</TableCell>
                      <TableCell align="right">{highest}%</TableCell>
                      <TableCell align="right">{lowest}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Attendance Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportClick}
            sx={{ mr: 2 }}
          >
            Export Report
          </Button>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newValue) => newValue && setViewMode(newValue)}
            size="small"
          >
            <ToggleButton value="daily">
              Daily View
            </ToggleButton>
            <ToggleButton value="history">
              History & Analytics
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {viewMode === 'daily' ? <DailyView /> : <HistoryView />}

      <Menu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={handleExportClose}
      >
        <MenuItem onClick={exportToExcel}>
          <ListItemIcon>
            <TableChartIcon />
          </ListItemIcon>
          Export to Excel
        </MenuItem>
        <MenuItem onClick={exportToPDF}>
          <ListItemIcon>
            <PictureAsPdfOutlined />
          </ListItemIcon>
          Export to PDF
        </MenuItem>
      </Menu>

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
    </Box>
  );
});

const DetailedView = React.memo(({ students = [], onEdit, onMarkAsPaid }) => {
  // Add a function to get batch name from student object
  const getBatchName = useCallback((student) => {
    if (!student) return 'N/A';
    return student.batch?.name || 'N/A';
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [newFee, setNewFee] = useState({
    studentId: '',
    feesMonth: format(new Date(), 'yyyy-MM'),
    amount: '',
    status: 'Unpaid',
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    paymentMode: 'Cash'
  });

  // Get unique months from fees data
  const uniqueMonths = useMemo(() => {
    if (!fees) return ['all'];
    const months = [...new Set(fees.map(fee => fee.feesMonth))].filter(Boolean);
    return ['all', ...months.sort().reverse()];
  }, [fees]);

  // Get unique batches from students
  const uniqueBatches = useMemo(() => {
    if (!students) return ['all'];
    const batches = [...new Set(students.map(student => student.batch?.name || student.batch))].filter(Boolean);
    return ['all', ...batches.sort()];
  }, [students]);

  // Filter and sort fees
  const filteredFees = useMemo(() => {
    if (!fees) return [];
    let result = [...fees];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(fee => 
        fee.Student?.name?.toLowerCase().includes(query) ||
        getBatchName(fee.Student)?.toLowerCase().includes(query) ||
        fee.feesMonth?.toLowerCase().includes(query)
      );
    }

    // Filter by batch
    if (selectedBatch !== 'all') {
      result = result.filter(fee => 
        getBatchName(fee.Student) === selectedBatch
      );
    }

    // Filter by month
    if (selectedMonth !== 'all') {
      result = result.filter(fee => 
        fee.feesMonth === selectedMonth
      );
    }

    // Sort
    result.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'name':
          aValue = a.Student?.name || '';
          bValue = b.Student?.name || '';
          break;
        case 'batch':
          aValue = getBatchName(a.Student) || '';
          bValue = getBatchName(b.Student) || '';
          break;
        case 'feesMonth':
          aValue = a.feesMonth || '';
          bValue = b.feesMonth || '';
          break;
        case 'amount':
          aValue = Number(a.amount) || 0;
          bValue = Number(b.amount) || 0;
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        default:
          aValue = a[sortField] || '';
          bValue = b[sortField] || '';
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [fees, searchQuery, selectedBatch, selectedMonth, sortField, sortDirection, getBatchName]);

  // Fetch fees data
  const fetchFees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getFees();
      setFees(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching fees:', err);
      setError('Failed to fetch fee data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = async (format) => {
    try {
      const data = filteredFees.map(fee => ({
        'Student Name': fee.Student?.name || '',
        'Batch': fee.Student?.batch?.name || fee.Student?.batch || '',
        'Fees Month': fee.feesMonth || '',
        'Amount': fee.amount || 0,
        'Status': fee.status || '',
        'Payment Date': fee.paymentDate || '',
        'Payment Mode': fee.paymentMode || ''
      }));

      if (format === 'excel') {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Fees Data');
        XLSX.writeFile(wb, 'fees_data.xlsx');
      } else if (format === 'pdf') {
        const doc = new jsPDF();
        doc.autoTable({
          head: [['Student Name', 'Batch', 'Fees Month', 'Amount', 'Status', 'Payment Date', 'Payment Mode']],
          body: data.map(row => Object.values(row))
        });
        doc.save('fees_data.pdf');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleAddFee = async (feeData) => {
    try {
      await api.addFee(feeData);
      await fetchFees(); // Refresh fees data
      setOpenAddDialog(false);
      setNewFee({
        studentId: '',
        feesMonth: format(new Date(), 'yyyy-MM'),
        amount: '',
        status: 'Unpaid',
        paymentDate: format(new Date(), 'yyyy-MM-dd'),
        paymentMode: 'Cash'
      });
    } catch (error) {
      console.error('Error adding fee:', error);
    }
  };

  const handleEditFee = async (feeData) => {
    try {
      if (!selectedFee) {
        console.error('No fee selected for editing');
        return;
      }

      const updatedFeeData = {
        feesMonth: feeData.feesMonth,
        amount: Number(feeData.amount),
        status: feeData.status,
        paymentDate: feeData.status === 'Paid' ? feeData.paymentDate : null,
        paymentMode: feeData.status === 'Paid' ? feeData.paymentMode : null
      };

      // Call the API to update the fee
      await api.updateFees(selectedFee.studentId, updatedFeeData);
      
      // Refresh the fees data
      await fetchFees();
      
      // Close the dialog and reset states
      setOpenEditDialog(false);
      setSelectedFee(null);
      setNewFee({
        studentId: '',
        feesMonth: format(new Date(), 'yyyy-MM'),
        amount: '',
        status: 'Unpaid',
        paymentDate: format(new Date(), 'yyyy-MM-dd'),
        paymentMode: 'Cash'
      });
    } catch (error) {
      console.error('Error editing fee:', error);
    }
  };

  const handleDeleteFee = async () => {
    try {
      await api.deleteFee(selectedFee.studentId, selectedFee.feesMonth);
      await fetchFees(); // Refresh fees data
      setOpenDeleteDialog(false);
      setSelectedFee(null);
    } catch (error) {
      console.error('Error deleting fee:', error);
    }
  };

  const handleMarkAsPaid = async (fee) => {
    try {
      await onMarkAsPaid(fee);
      await fetchFees(); // Refresh fees data after marking as paid
    } catch (error) {
      console.error('Error marking fee as paid:', error);
    }
  };

  const handleEditClick = (fee) => {
    setSelectedFee(fee);
    // Format the feesMonth to ensure it's in the correct format (YYYY-MM)
    const formattedMonth = fee.feesMonth ? format(parseISO(fee.feesMonth), 'yyyy-MM') : format(new Date(), 'yyyy-MM');
    
    setNewFee({
      studentId: fee.studentId,
      feesMonth: formattedMonth,
      amount: fee.amount,
      status: fee.status,
      paymentDate: fee.paymentDate || format(new Date(), 'yyyy-MM-dd'),
      paymentMode: fee.paymentMode || 'Cash'
    });
    setOpenEditDialog(true);
  };

  if (loading) {
  return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Filter by Batch</InputLabel>
            <Select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              label="Filter by Batch"
            >
              {uniqueBatches.map((batch) => (
                <MenuItem key={batch} value={batch}>
                  {batch === 'all' ? 'All Batches' : batch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Filter by Month</InputLabel>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              label="Filter by Month"
            >
              {uniqueMonths.map((month) => (
                <MenuItem key={month} value={month}>
                  {month === 'all' ? 'All Months' : format(parseISO(month), 'MMMM yyyy')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddDialog(true)}
              sx={{ mr: 1 }}
            >
              Add Fee
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExport('excel')}
            >
              Export Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExport('pdf')}
            >
              Export PDF
            </Button>
          </Box>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                Student Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('batch')} style={{ cursor: 'pointer' }}>
                Batch {sortField === 'batch' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('feesMonth')} style={{ cursor: 'pointer' }}>
                Fees Month {sortField === 'feesMonth' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('amount')} style={{ cursor: 'pointer' }}>
                Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('paymentDate')} style={{ cursor: 'pointer' }}>
                Payment Date {sortField === 'paymentDate' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('paymentMode')} style={{ cursor: 'pointer' }}>
                Payment Mode {sortField === 'paymentMode' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No fee records found
                </TableCell>
              </TableRow>
            ) : (
              filteredFees.map((fee) => (
                <TableRow key={`${fee.studentId}-${fee.feesMonth}`}>
                  <TableCell>{fee.Student?.name || ''}</TableCell>
                  <TableCell>{getBatchName(fee.Student)}</TableCell>
                  <TableCell>{fee.feesMonth || ''}</TableCell>
                  <TableCell>₹{fee.amount || 0}</TableCell>
                <TableCell>
                  <Chip 
                      label={fee.status || 'Unpaid'}
                      color={fee.status === 'Paid' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                  <TableCell>{fee.paymentDate || '-'}</TableCell>
                  <TableCell>{fee.paymentMode || '-'}</TableCell>
                  <TableCell>
                      <IconButton 
                        size="small" 
                      onClick={() => handleEditClick(fee)}
                      sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    {fee.status !== 'Paid' && (
                        <IconButton 
                          size="small"
                        onClick={() => handleMarkAsPaid(fee)}
                          color="success"
                        sx={{ mr: 1 }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedFee(fee);
                        setOpenDeleteDialog(true);
                      }}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Fee Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Fee Record</DialogTitle>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddFee(newFee);
        }}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Student</InputLabel>
                  <Select
                    value={newFee.studentId}
                    onChange={(e) => setNewFee(prev => ({ ...prev, studentId: e.target.value }))}
                    label="Student"
                    required
                  >
                    {students.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.name} - {student.batch?.name || student.batch}
        </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Fees Month"
                  name="feesMonth"
                  type="month"
                  value={newFee.feesMonth}
                  onChange={(e) => setNewFee(prev => ({ ...prev, feesMonth: e.target.value }))}
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
                  value={newFee.amount}
                  onChange={(e) => setNewFee(prev => ({ ...prev, amount: e.target.value }))}
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
                    value={newFee.status}
                    onChange={(e) => setNewFee(prev => ({ ...prev, status: e.target.value }))}
                    label="Status"
                  >
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Unpaid">Unpaid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {newFee.status === 'Paid' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Payment Date"
                      name="paymentDate"
                      type="date"
                      value={newFee.paymentDate}
                      onChange={(e) => setNewFee(prev => ({ ...prev, paymentDate: e.target.value }))}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Payment Mode</InputLabel>
                      <Select
                        name="paymentMode"
                        value={newFee.paymentMode}
                        onChange={(e) => setNewFee(prev => ({ ...prev, paymentMode: e.target.value }))}
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
            <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Add Fee
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Fee Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Fee Record</DialogTitle>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleEditFee(newFee);
        }}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Student: {selectedFee?.Student?.name || 'N/A'}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Batch: {getBatchName(selectedFee?.Student)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Fees Month"
                  name="feesMonth"
                  type="month"
                  value={newFee.feesMonth}
                  onChange={(e) => setNewFee(prev => ({ ...prev, feesMonth: e.target.value }))}
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
                  value={newFee.amount}
                  onChange={(e) => setNewFee(prev => ({ ...prev, amount: e.target.value }))}
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
                    value={newFee.status}
                    onChange={(e) => setNewFee(prev => ({ ...prev, status: e.target.value }))}
                    label="Status"
                  >
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Unpaid">Unpaid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {newFee.status === 'Paid' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Payment Date"
                      name="paymentDate"
                      type="date"
                      value={newFee.paymentDate}
                      onChange={(e) => setNewFee(prev => ({ ...prev, paymentDate: e.target.value }))}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Payment Mode</InputLabel>
                      <Select
                        name="paymentMode"
                        value={newFee.paymentMode}
                        onChange={(e) => setNewFee(prev => ({ ...prev, paymentMode: e.target.value }))}
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
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Update Fee
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the fee record for {selectedFee?.Student?.name} for the month of {selectedFee?.feesMonth}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteFee} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

const VisualizationsView = React.memo(({ 
  filteredStudents, 
  students, 
  batchSummary, 
  selectedTimeRange 
}) => {
  // Get unique months from the last 3 months
  const availableMonths = useMemo(() => {
    const months = new Set();
    const today = new Date();
    
    // Add last 3 months
    for (let i = 0; i < 3; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.add(format(date, 'yyyy-MM'));
    }
    
    return Array.from(months).sort().reverse();
  }, []);

  // Group students by month for the summary
  const monthlyStats = useMemo(() => {
    const stats = {};
    availableMonths.forEach(month => {
      // Since students don't have feesMonth anymore, we'll use current month for all students
      const monthStudents = students.filter(student => {
        // For now, include all students in current month since fees are separate
        return true;
      });
      
      const totalAmount = monthStudents.reduce((sum, s) => sum + Number(s.amount || 0), 0);
      const collectedAmount = monthStudents
        .filter(s => s.status === 'Paid')
        .reduce((sum, s) => sum + Number(s.amount || 0), 0);
      
      stats[month] = {
        total: monthStudents.length,
        paid: monthStudents.filter(s => s.status === 'Paid').length,
        unpaid: monthStudents.filter(s => s.status === 'Unpaid').length,
        amount: totalAmount,
        collectedAmount: collectedAmount,
        pendingAmount: totalAmount - collectedAmount
      };
    });
    return stats;
  }, [students, availableMonths]);

  const currentMetrics = useMemo(() => ({
    totalStudents: filteredStudents.length,
    totalFees: filteredStudents.reduce((sum, student) => sum + Number(student.amount || 0), 0),
    overdueCount: filteredStudents.filter(student => {
      // Check if student has unpaid status and if we can determine if it's overdue
      if (student.status === 'Unpaid' && student.feesMonth) {
        try {
          return isPast(parseISO(student.feesMonth));
        } catch (error) {
          return false;
        }
      }
      return false;
    }).length,
    collectionRate: filteredStudents.length > 0 
      ? (filteredStudents.filter(s => s.status === 'Paid').length / filteredStudents.length) * 100 
      : 0
  }), [filteredStudents]);

  const getMonthlyTrends = useCallback(() => {
    const monthlyData = {};
    
    // Since students don't have feesMonth, we'll create a simple trend based on current data
    const currentMonth = format(new Date(), 'MMMM yyyy');
    
    // Group by current month for now
    students.forEach(student => {
      if (!monthlyData[currentMonth]) {
        monthlyData[currentMonth] = {
          month: currentMonth,
          totalFees: 0,
          collectedFees: 0,
          pendingFees: 0,
          totalStudents: 0,
          paidStudents: 0
        };
      }
      
      const studentAmount = Number(student.amount || 0);
      monthlyData[currentMonth].totalFees += studentAmount;
      monthlyData[currentMonth].totalStudents += 1;
      
      if (student.status === 'Paid') {
        monthlyData[currentMonth].collectedFees += studentAmount;
        monthlyData[currentMonth].paidStudents += 1;
      } else {
        monthlyData[currentMonth].pendingFees += studentAmount;
      }
    });

    // Convert to array and sort by date
    return Object.values(monthlyData)
      .sort((a, b) => new Date(a.month) - new Date(b.month))
      .slice(-parseInt(selectedTimeRange));
  }, [students, selectedTimeRange]);

  const monthlyTrends = useMemo(() => getMonthlyTrends(), [getMonthlyTrends]);

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={currentMetrics.totalStudents}
            icon={<GroupOutlined sx={{ color: '#1976d2' }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Fees"
            value={formatCurrency(currentMetrics.totalFees)}
            icon={<PaidOutlined sx={{ color: '#2e7d32' }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Overdue"
            value={currentMetrics.overdueCount}
            icon={<WarningAmberOutlined sx={{ color: '#d32f2f' }} />}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Collection Rate"
            value={`${Math.round(currentMetrics.collectionRate)}%`}
            icon={<TrendingUpOutlined sx={{ color: '#7b1fa2' }} />}
            color="#7b1fa2"
          />
        </Grid>
      </Grid>

      {/* Monthly Analytics Cards */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Monthly Analytics
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {availableMonths.map(month => {
          const stats = monthlyStats[month];
          const collectionRate = stats.total ? (stats.paid / stats.total) * 100 : 0;
          
          return (
            <Grid item xs={12} md={4} key={month}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {format(parseISO(`${month}-01`), 'MMMM yyyy')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Students: {stats.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Paid: {stats.paid}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Unpaid: {stats.unpaid}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Amount: {formatCurrency(stats.amount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Collected: {formatCurrency(stats.collectedAmount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending: {formatCurrency(stats.pendingAmount)}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={collectionRate}
                      sx={{ height: 8, borderRadius: 5 }}
                    />
                    <Typography variant="body2" color="text.secondary" align="right" sx={{ mt: 1 }}>
                      Collection Rate: {Math.round(collectionRate)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Monthly Collection Trends</Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(value) => format(new Date(value), 'MMM yy')}
                    />
                    <YAxis 
                      tickFormatter={(value) => `₹${value / 1000}K`}
                    />
                    <RechartsTooltip
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(label) => format(new Date(label), 'MMMM yyyy')}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="collectedFees"
                      stackId="1"
                      stroke="#4caf50"
                      fill="#4caf50"
                      name="Collected"
                    />
                    <Area
                      type="monotone"
                      dataKey="pendingFees"
                      stackId="1"
                      stroke="#ff9800"
                      fill="#ff9800"
                      name="Pending"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Collection Rate by Batch</Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={batchSummary}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis dataKey="batch" type="category" width={100} />
                    <RechartsTooltip
                      formatter={(value) => `${Math.round(value)}%`}
                    />
                    <Legend />
                    <Bar
                      dataKey="collectionRate"
                      fill="#2196f3"
                      name="Collection Rate"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
});

const FeesDashboard = ({ initialTab }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Add user role state
  const [userRole] = useState(localStorage.getItem('userRole') || 'admin');
  const [userName] = useState(localStorage.getItem('userName') || 'Admin User');
  
  // Set initial tab based on role and initialTab prop
  const getInitialTab = () => {
    if (userRole === 'trainer') return 2;
    if (initialTab === 'attendance') return 2;
    if (initialTab === 'visualizations') return 1;
    return 0;
  };
  
  const [selectedTab, setSelectedTab] = useState(getInitialTab());
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

  // Fetch students and attendance data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching initial data...');
        
        // Fetch students data
        const data = await api.getStudents();
        console.log('Fetched students:', data);
        setStudents(data);
        
        // Fetch attendance data for current date
        const today = format(new Date(), 'yyyy-MM-dd');
        console.log('Fetching attendance:', { date: today, batch: 'all' });
        const attendance = await api.getAttendance(today, 'all');
        console.log('Fetched attendance data:', attendance);
        
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
  const [overdueStudents, setOverdueStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [orderBy, setOrderBy] = useState('feesMonth');
  const [order, setOrder] = useState('desc');
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('3');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    batch: '',
    feesMonth: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    status: 'Unpaid'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editStudent, setEditStudent] = useState({
    name: '',
    batch: '',
    feesMonth: '',
    amount: '',
    status: ''
  });
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const [openCreateUserDialog, setOpenCreateUserDialog] = useState(false);
  const [openListUsersDialog, setOpenListUsersDialog] = useState(false);
  const sessionTimeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);

  // Session timeout constants
  const SESSION_TIMEOUT_DURATION = 2 * 60 * 60 * 1000; // 2 hours
  const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes warning

  // Remove or modify the useEffect that sets up the reminder
  useEffect(() => {
    const overdue = students.filter(student => 
      student.status === 'Unpaid' && isPast(parseISO(student.feesMonth))
    );
    setOverdueStudents(overdue);
  }, [students]);

  // Filter and sort students
  useEffect(() => {
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
    
    setFilteredStudents(filtered);
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

    console.log('Setting up session timeout');
    
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
      await api.addStudent(studentData);
      const updatedStudents = await api.getStudents();
      setStudents(updatedStudents);
      setSnackbar({ open: true, message: 'Student added successfully', severity: 'success' });
    } catch (error) {
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

  // Add effect to populate edit form when selectedStudent changes
  useEffect(() => {
    if (selectedStudent) {
      setEditStudent({
        name: selectedStudent.name || '',
        batch: selectedStudent.batch || '',
        feesMonth: selectedStudent.feesMonth || format(new Date(), 'yyyy-MM'),
        amount: selectedStudent.amount ? String(selectedStudent.amount) : '',
        status: selectedStudent.status || 'Unpaid',
        paymentDate: selectedStudent.paymentDate || format(new Date(), 'yyyy-MM-dd'),
        paymentMode: selectedStudent.paymentMode || 'Cash'
      });
    }
  }, [selectedStudent]);

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

  const getRowStyle = (status, feesMonth) => {
    if (status === 'Unpaid' && isPast(parseISO(feesMonth))) {
      return { backgroundColor: '#ffebee' };
    }
    return {};
  };

  // Derived data
  const uniqueBatches = useMemo(() => 
    Array.from(new Set(students.map(student => student.batch?.name || student.batch))).filter(Boolean).sort(),
    [students]
  );
  const uniqueMonths = useMemo(() => 
    Array.from(new Set(students
      .filter(student => isValidDateString(student.feesMonth))
      .map(student => format(parseISO(student.feesMonth), 'MMMM yyyy'))
    )).sort(),
    [students]
  );

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
    <Box sx={{ overflow: 'auto' }}>
      <Logo />
      <Divider />
      <List>
        {userRole === 'admin' && (
          <>
            <ListItem button selected={selectedTab === 0} onClick={() => setSelectedTab(0)}>
              <ListItemIcon>
                <TableChartIcon />
              </ListItemIcon>
              <ListItemText primary="Detailed View" />
            </ListItem>
            <ListItem button selected={selectedTab === 1} onClick={() => setSelectedTab(1)}>
              <ListItemIcon>
                <InsertChartIcon />
              </ListItemIcon>
              <ListItemText primary="Visualizations" />
            </ListItem>
            <ListItem button selected={selectedTab === 3} onClick={() => setSelectedTab(3)}>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Students" />
            </ListItem>
            <ListItem button selected={selectedTab === 4} onClick={() => setSelectedTab(4)}>
              <ListItemIcon>
                <GroupWorkIcon />
              </ListItemIcon>
              <ListItemText primary="Batches" />
            </ListItem>
          </>
        )}
        <ListItem button selected={selectedTab === 2} onClick={() => setSelectedTab(2)}>
          <ListItemIcon>
            <TodayIcon />
          </ListItemIcon>
          <ListItemText primary="Attendance" />
        </ListItem>
      </List>
    </Box>
  );

  const mainContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      );
    }

    switch(selectedTab) {
      case 0:
        return (
          <Box sx={{ p: 2 }}>
            <DetailedView 
              students={students}
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
          <Box sx={{ p: 2 }}>
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
          <Box sx={{ p: 2 }}>
            <AttendanceView 
              students={students} 
              uniqueBatches={uniqueBatches} 
              batchSummary={batchSummary}
              attendanceData={attendanceData}
              setAttendanceData={setAttendanceData}
              isLoadingAttendance={isLoadingAttendance}
              setIsLoadingAttendance={setIsLoadingAttendance}
            />
          </Box>
        );
      case 3:
        return (
          <Box sx={{ p: 2 }}>
            <StudentsView />
          </Box>
        );
      case 4:
        return (
          <Box sx={{ p: 2 }}>
            <BatchesView />
          </Box>
        );
      default:
        return (
          <Box sx={{ p: 2 }}>
            <DetailedView />
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
        <MenuItem>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="My Profile" />
        </MenuItem>
        <MenuItem>
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
          p: 0, // Remove default padding
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // Height of AppBar
          height: 'calc(100vh - 64px)',
          overflow: 'auto'
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
      >
        <DialogTitle id="logout-dialog-title">
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to log out? Any unsaved changes will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel}>Cancel</Button>
          <Button onClick={handleLogoutConfirm} color="error" variant="contained">
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
    </Box>
  );
};

export default FeesDashboard; 