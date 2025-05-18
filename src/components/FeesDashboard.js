import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Close as CloseIcon
} from '@mui/icons-material';
import { format, isPast, parseISO, isAfter, isBefore, subDays, addDays, startOfMonth } from 'date-fns';
import { utils as xlsxUtils, writeFile } from 'xlsx';
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

const AddStudentDialog = React.memo(({ 
  open, 
  onClose, 
  onAdd, 
  uniqueBatches, 
  newStudent, 
  onInputChange 
}) => {
  const [isNewBatch, setIsNewBatch] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [batchError, setBatchError] = useState('');

  const handleBatchChange = (event) => {
    const value = event.target.value;
    if (value === 'new') {
      setIsNewBatch(true);
      onInputChange({ target: { name: 'batch', value: '' } });
    } else {
      setIsNewBatch(false);
      onInputChange(event);
    }
  };

  const handleNewBatchChange = (event) => {
    const value = event.target.value;
    setNewBatchName(value);
    
    // Update batch name validation
    if (value && !/^[A-Za-z]+-[A-Za-z]+(-[A-Za-z]+)?$/.test(value)) {
      setBatchError('Batch should be in format: Style-Level (e.g., Freestyle-Senior)');
    } else {
      setBatchError('');
      onInputChange({ target: { name: 'batch', value } });
    }
  };

  const handleClose = () => {
    setIsNewBatch(false);
    setNewBatchName('');
    setBatchError('');
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onAdd();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please fill in the student details below
          </DialogContentText>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              autoFocus
              name="name"
              label="Student Name"
              type="text"
              fullWidth
              value={newStudent.name}
              onChange={onInputChange}
              required
            />
            
            {!isNewBatch ? (
              <FormControl fullWidth required>
                <InputLabel>Batch</InputLabel>
                <Select
                  name="batch"
                  value={newStudent.batch}
                  onChange={handleBatchChange}
                  label="Batch"
                >
                  {uniqueBatches.map((batch) => (
                    <MenuItem key={batch} value={batch}>
                      {batch}
                    </MenuItem>
                  ))}
                  <MenuItem value="new" sx={{ color: 'primary.main' }}>
                    <AddIcon sx={{ mr: 1 }} />
                    Add New Batch
                  </MenuItem>
                </Select>
              </FormControl>
            ) : (
              <TextField
                name="newBatch"
                label="New Batch"
                type="text"
                fullWidth
                value={newBatchName}
                onChange={handleNewBatchChange}
                required
                error={Boolean(batchError)}
                helperText={batchError || "Enter batch in format: Style-Level (e.g., Freestyle-Senior)"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => {
                          setIsNewBatch(false);
                          setNewBatchName('');
                          setBatchError('');
                          onInputChange({ target: { name: 'batch', value: '' } });
                        }}
                        edge="end"
                      >
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}

            <TextField
              name="feesMonth"
              label="Fees Month"
              type="date"
              fullWidth
              value={newStudent.feesMonth}
              onChange={onInputChange}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <TextField
              name="amount"
              label="Fees Amount"
              type="number"
              fullWidth
              value={newStudent.amount}
              onChange={onInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              required
            />
            <TextField
              select
              name="status"
              label="Payment Status"
              fullWidth
              value={newStudent.status}
              onChange={onInputChange}
              required
            >
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Unpaid">Unpaid</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            type="submit"
            variant="contained"
            disabled={
              !newStudent.name || 
              !newStudent.batch || 
              !newStudent.amount ||
              (isNewBatch && Boolean(batchError))
            }
          >
            Add Student
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

const EditStudentDialog = React.memo(({ 
  open, 
  onClose, 
  onUpdate, 
  uniqueBatches, 
  editStudent, 
  onInputChange 
}) => (
  <Dialog 
    open={open} 
    onClose={onClose}
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle>Edit Student Details</DialogTitle>
    <DialogContent>
      <DialogContentText sx={{ mb: 2 }}>
        Update the student information below
      </DialogContentText>
      <Stack spacing={2} sx={{ mt: 2 }}>
        <TextField
          autoFocus
          name="name"
          label="Student Name"
          type="text"
          fullWidth
          value={editStudent.name}
          onChange={onInputChange}
          required
        />
        <TextField
          select
          name="batch"
          label="Batch"
          fullWidth
          value={editStudent.batch}
          onChange={onInputChange}
          required
        >
          {uniqueBatches.map((batch) => (
            <MenuItem key={batch} value={batch}>
              Batch {batch}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          name="feesMonth"
          label="Fees Month"
          type="date"
          fullWidth
          value={editStudent.feesMonth}
          onChange={onInputChange}
          InputLabelProps={{
            shrink: true,
          }}
          required
        />
        <TextField
          name="amount"
          label="Fees Amount"
          type="number"
          fullWidth
          value={editStudent.amount}
          onChange={onInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
          }}
          required
        />
        <TextField
          select
          name="status"
          label="Payment Status"
          fullWidth
          value={editStudent.status}
          onChange={onInputChange}
          required
        >
          <MenuItem value="Paid">Paid</MenuItem>
          <MenuItem value="Unpaid">Unpaid</MenuItem>
        </TextField>
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button 
        onClick={onUpdate}
        variant="contained"
        disabled={!editStudent.name || !editStudent.batch || !editStudent.amount}
      >
        Update
      </Button>
    </DialogActions>
  </Dialog>
));

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
    setShowingDate(format(parseISO(newDate), 'MMMM dd, yyyy'));
  }, []);

  // Memoize handleBatchChange function
  const handleBatchChange = useCallback((event) => {
    const newBatch = event.target.value;
    setSelectedBatch(newBatch);
  }, []);

  // Fetch attendance data when date changes
  useEffect(() => {
    fetchAttendance(selectedDate, selectedBatch);
  }, [selectedDate, selectedBatch, fetchAttendance]);

  const getAttendanceStats = (date = selectedDate, batch = selectedBatch) => {
    if (!date) {
      return { total: 0, present: 0, absent: 0, percentage: 0 };
    }

    const currentDateAttendance = attendanceData[date] || {};
    const filteredStudents = students.filter(s => 
      batch === 'all' || s.batch === batch
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
    selectedBatch === 'all' || student.batch === selectedBatch
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
                  <TableCell>{student.batch}</TableCell>
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

const DetailedView = React.memo(({ 
  searchQuery, 
  setSearchQuery, 
  selectedBatch, 
  setSelectedBatch, 
  selectedStatus, 
  setSelectedStatus, 
  uniqueBatches, 
  filteredStudents,
  orderBy,
  order,
  handleSort,
  getRowStyle,
  handleMarkAsPaid,
  handleDeleteStudent,
  setOpenAddDialog,
  setSelectedStudent,
  setOpenEditDialog,
  batchSummary
}) => {
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [showAllMonths, setShowAllMonths] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

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

  // Filter students by selected month if not showing all months
  const displayedStudents = useMemo(() => {
    if (showAllMonths) {
      return filteredStudents;
    }
    return filteredStudents.filter(student => 
      format(parseISO(student.feesMonth), 'yyyy-MM') === selectedMonth
    );
  }, [filteredStudents, selectedMonth, showAllMonths]);

  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const exportToExcel = () => {
    try {
      handleExportClose();
      const workbook = xlsxUtils.book_new();
      
      // Create worksheet for student data
      const studentData = filteredStudents.map(student => ({
        'Student Name': student.name,
        'Batch': student.batch,
        'Fees Month': format(parseISO(student.feesMonth), 'MMMM yyyy'),
        'Amount': student.amount,
        'Status': student.status
      }));
      const ws = xlsxUtils.json_to_sheet(studentData);
      
      // Add column widths
      ws['!cols'] = [
        { wch: 20 }, // Student Name
        { wch: 10 }, // Batch
        { wch: 15 }, // Fees Month
        { wch: 15 }, // Amount
        { wch: 10 }  // Status
      ];
      
      xlsxUtils.book_append_sheet(workbook, ws, 'Students');

      // Create worksheet for batch summary
      const batchData = batchSummary.map(batch => ({
        'Batch': batch.batch,
        'Total Students': batch.totalStudents,
        'Fees Collected': batch.feesCollected,
        'Pending Amount': batch.pendingAmount,
        'Collection Rate': `${Math.round(batch.collectionRate)}%`
      }));
      const batchWs = xlsxUtils.json_to_sheet(batchData);
      
      // Add column widths for batch summary
      batchWs['!cols'] = [
        { wch: 10 }, // Batch
        { wch: 15 }, // Total Students
        { wch: 15 }, // Fees Collected
        { wch: 15 }, // Pending Amount
        { wch: 15 }  // Collection Rate
      ];
      
      xlsxUtils.book_append_sheet(workbook, batchWs, 'Batch Summary');

      // Save the file
      writeFile(workbook, 'fees_report.xlsx');
      setSnackbar({
        open: true,
        message: 'Report exported to Excel successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setSnackbar({
        open: true,
        message: 'Failed to export to Excel. Please try again.',
        severity: 'error'
      });
    }
  };

  const exportToPDF = () => {
    try {
      handleExportClose();
      const doc = new jsPDF();
      
      // Add title and date
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
        `${Math.round(batch.collectionRate)}%`
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
      setSnackbar({
        open: true,
        message: 'Report exported to PDF successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      setSnackbar({
        open: true,
        message: 'Failed to export to PDF. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (studentToDelete) {
      handleDeleteStudent(studentToDelete);
    }
    setDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by student name..."
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
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Batch</InputLabel>
            <Select
              value={selectedBatch}
              label="Batch"
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              <MenuItem value="all">All Batches</MenuItem>
              {uniqueBatches.map((batch) => (
                <MenuItem key={batch} value={batch}>
                  {batch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              label="Status"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Unpaid">Unpaid</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Month</InputLabel>
            <Select
              value={showAllMonths ? 'all' : selectedMonth}
              label="Month"
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'all') {
                  setShowAllMonths(true);
                } else {
                  setShowAllMonths(false);
                  setSelectedMonth(value);
                }
              }}
            >
              <MenuItem value="all">All Months</MenuItem>
              {availableMonths.map((month) => (
                <MenuItem key={month} value={month}>
                  {format(parseISO(`${month}-01`), 'MMMM yyyy')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportClick}
            sx={{ height: '56px' }}
          >
            Export
          </Button>
        </Grid>
      </Grid>

      <Fab 
        color="primary" 
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16 
        }}
        onClick={() => setOpenAddDialog(true)}
        aria-label="add student"
      >
        <AddIcon />
      </Fab>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="fees table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Student Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'batch'}
                  direction={orderBy === 'batch' ? order : 'asc'}
                  onClick={() => handleSort('batch')}
                >
                  Batch
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'feesMonth'}
                  direction={orderBy === 'feesMonth' ? order : 'asc'}
                  onClick={() => handleSort('feesMonth')}
                >
                  Month
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'amount'}
                  direction={orderBy === 'amount' ? order : 'asc'}
                  onClick={() => handleSort('amount')}
                >
                  Fees Amount
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedStudents.map((student) => (
              <TableRow
                key={student.id}
                sx={getRowStyle(student.status, student.feesMonth)}
              >
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.batch}</TableCell>
                <TableCell>{format(parseISO(student.feesMonth), 'MMMM yyyy')}</TableCell>
                <TableCell>{formatCurrency(student.amount)}</TableCell>
                <TableCell>
                  <Chip 
                    label={student.status}
                    color={student.status === 'Paid' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setSelectedStudent(student);
                          setOpenEditDialog(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {student.status === 'Unpaid' && (
                      <Tooltip title="Mark as Paid">
                        <IconButton 
                          size="small"
                          color="success"
                          onClick={() => handleMarkAsPaid(student)}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClick(student)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {displayedStudents.length === 0 && (
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

      {/* Add Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ color: 'error.main' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete {studentToDelete?.name}'s record? This action cannot be undone.
          </DialogContentText>
          {studentToDelete && (
            <Box sx={{ mt: 2, bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Student Name:</strong> {studentToDelete.name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Batch:</strong> {studentToDelete.batch}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Month:</strong> {format(parseISO(studentToDelete.feesMonth), 'MMMM yyyy')}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {studentToDelete.status}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
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
      const monthStudents = students.filter(student => 
        format(parseISO(student.feesMonth), 'yyyy-MM') === month
      );
      
      const totalAmount = monthStudents.reduce((sum, s) => sum + Number(s.amount), 0);
      const collectedAmount = monthStudents
        .filter(s => s.status === 'Paid')
        .reduce((sum, s) => sum + Number(s.amount), 0);
      
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
    totalFees: filteredStudents.reduce((sum, student) => sum + Number(student.amount), 0),
    overdueCount: filteredStudents.filter(student => 
      student.status === 'Unpaid' && isPast(parseISO(student.feesMonth))
    ).length,
    collectionRate: filteredStudents.length > 0 
      ? (filteredStudents.filter(s => s.status === 'Paid').length / filteredStudents.length) * 100 
      : 0
  }), [filteredStudents]);

  const getMonthlyTrends = useCallback(() => {
    const monthlyData = {};
    
    // Sort students by month
    const sortedStudents = [...students].sort((a, b) => 
      parseISO(b.feesMonth) - parseISO(a.feesMonth)
    );

    // Group by month
    sortedStudents.forEach(student => {
      const month = format(parseISO(student.feesMonth), 'MMMM yyyy');
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          totalFees: 0,
          collectedFees: 0,
          pendingFees: 0,
          totalStudents: 0,
          paidStudents: 0
        };
      }
      
      const amount = Number(student.amount);
      monthlyData[month].totalFees += amount;
      monthlyData[month].totalStudents += 1;
      
      if (student.status === 'Paid') {
        monthlyData[month].collectedFees += amount;
        monthlyData[month].paidStudents += 1;
      } else {
        monthlyData[month].pendingFees += amount;
      }
    });

    // Convert to array and sort by date (oldest to newest for x-axis left to right)
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
  const [sessionTimeout, setSessionTimeout] = useState(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [anchorElProfile, setAnchorElProfile] = useState(null);

  // Session timeout constants
  const SESSION_TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
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
      filtered = filtered.filter(student => student.batch === selectedBatch);
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
        // For dates, we want the most recent dates first by default
        compareResult = isAfter(parseISO(a.feesMonth), parseISO(b.feesMonth)) ? -1 : 1;
      } else {
        // For other fields, first sort by date (most recent first)
        const dateCompare = isAfter(parseISO(a.feesMonth), parseISO(b.feesMonth)) ? -1 : 1;
        
        // Then apply the selected sort
        let fieldCompare = 0;
        if (orderBy === 'name') {
          fieldCompare = a.name.localeCompare(b.name);
        } else if (orderBy === 'batch') {
          fieldCompare = a.batch.localeCompare(b.batch);
        } else if (orderBy === 'amount') {
          fieldCompare = a.amount - b.amount;
        } else if (orderBy === 'status') {
          fieldCompare = a.status.localeCompare(b.status);
        }
        
        // Use the field comparison first, then date as secondary sort
        compareResult = fieldCompare || dateCompare;
      }
      
      return order === 'desc' ? compareResult : -compareResult;
    });
    
    setFilteredStudents(filtered);
  }, [students, searchQuery, selectedBatch, selectedStatus, selectedMonth, orderBy, order]);

  // Session timeout effect
  useEffect(() => {
    const handleSessionTimeout = () => {
      localStorage.removeItem('isAuthenticated');
      navigate('/');
      setSnackbar({
        open: true,
        message: 'Session expired. Please log in again.',
        severity: 'warning'
      });
    };

    const resetSessionTimeout = () => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
      
      const warningTimeout = setTimeout(() => {
        setShowSessionWarning(true);
      }, SESSION_TIMEOUT_DURATION - SESSION_WARNING_TIME);

      const timeout = setTimeout(() => {
        handleSessionTimeout();
      }, SESSION_TIMEOUT_DURATION);

      setSessionTimeout(timeout);

      return () => {
        clearTimeout(warningTimeout);
        clearTimeout(timeout);
      };
    };

    const handleUserActivity = () => {
      resetSessionTimeout();
      setShowSessionWarning(false);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    resetSessionTimeout();

    return () => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [sessionTimeout, navigate]);

  // Handlers for student management
  const handleAddStudent = async () => {
    try {
      if (!newStudent.name || !newStudent.batch || !newStudent.feesMonth || !newStudent.amount) {
        setSnackbar({ 
          open: true, 
          message: 'Please fill in all required fields', 
          severity: 'error' 
        });
        return;
      }

      // Generate a unique ID using timestamp and random string
      const timestamp = new Date().getTime();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const uniqueId = `${timestamp}-${randomStr}`;

      // Create a new student object with the correct format
      const studentData = {
        id: uniqueId,
        name: newStudent.name,
        batch: newStudent.batch,
        feesMonth: newStudent.feesMonth,
        amount: parseFloat(newStudent.amount),
        status: newStudent.status || 'Unpaid'
      };

      console.log('Adding new student:', studentData);
      const addedStudent = await api.addStudent(studentData);
      console.log('Student added successfully:', addedStudent);

      // Refresh students data
      const updatedStudents = await api.getStudents();
      setStudents(updatedStudents);
      
      // Reset form and close dialog
      setNewStudent({
        name: '',
        batch: '',
        feesMonth: format(new Date(), 'yyyy-MM-dd'),
        amount: '',
        status: 'Unpaid'
      });
      setOpenAddDialog(false);
      
      setSnackbar({ 
        open: true, 
        message: 'Student added successfully', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error adding student:', error);
      setSnackbar({ 
        open: true, 
        message: `Failed to add student: ${error.response?.data?.message || error.message}`, 
        severity: 'error' 
      });
    }
  };

  const handleUpdateStudent = async () => {
    try {
      if (!selectedStudent) {
        setSnackbar({ open: true, message: 'No student selected for update', severity: 'error' });
        return;
      }
      await api.updateStudent(selectedStudent.id, editStudent);
      // Refresh students data
      const updatedStudents = await api.getStudents();
      setStudents(updatedStudents);
      setOpenEditDialog(false);
      setSnackbar({ open: true, message: 'Student updated successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update student', severity: 'error' });
    }
  };

  // Add effect to populate edit form when selectedStudent changes
  useEffect(() => {
    if (selectedStudent) {
      setEditStudent({
        name: selectedStudent.name,
        batch: selectedStudent.batch,
        feesMonth: selectedStudent.feesMonth,
        amount: selectedStudent.amount.toString(),
        status: selectedStudent.status
      });
    }
  }, [selectedStudent]);

  const handleMarkAsPaid = async (student) => {
    try {
      await api.markAsPaid(student.id);
      // Refresh students data
      const updatedStudents = await api.getStudents();
      setStudents(updatedStudents);
      setSnackbar({ 
        open: true, 
        message: `${student.name}'s payment has been marked as paid`, 
        severity: 'success' 
      });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to update payment status', 
        severity: 'error' 
      });
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
    Array.from(new Set(students.map(student => student.batch))).sort(),
    [students]
  );
  const uniqueMonths = useMemo(() => 
    Array.from(new Set(students.map(student => 
      format(parseISO(student.feesMonth), 'MMMM yyyy')
    ))).sort(),
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
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedBatch={selectedBatch}
              setSelectedBatch={setSelectedBatch}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              uniqueBatches={uniqueBatches}
              filteredStudents={filteredStudents}
              orderBy={orderBy}
              order={order}
              handleSort={handleSort}
              getRowStyle={getRowStyle}
              handleMarkAsPaid={handleMarkAsPaid}
              handleDeleteStudent={handleDeleteStudent}
              setOpenAddDialog={setOpenAddDialog}
              setSelectedStudent={setSelectedStudent}
              setOpenEditDialog={setOpenEditDialog}
              batchSummary={batchSummary}
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
    navigate('/');
    setSnackbar({ open: true, message: 'Logged out successfully!', severity: 'success' });
  };

  const handleExtendSession = () => {
    setShowSessionWarning(false);
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    const newTimeout = setTimeout(() => {
      setShowSessionWarning(true);
    }, 55 * 60 * 1000); // Show warning 5 minutes before session expires
    setSessionTimeout(newTimeout);
  };

  const handleLogoutNow = () => {
    setShowSessionWarning(false);
    handleLogoutConfirm();
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
        uniqueBatches={uniqueBatches}
        newStudent={newStudent}
        onInputChange={(e) => setNewStudent(prev => ({ ...prev, [e.target.name]: e.target.value }))}
      />

      <EditStudentDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        onUpdate={handleUpdateStudent}
        uniqueBatches={uniqueBatches}
        editStudent={editStudent}
        onInputChange={(e) => setEditStudent(prev => ({ ...prev, [e.target.name]: e.target.value }))}
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
    </Box>
  );
};

export default FeesDashboard; 