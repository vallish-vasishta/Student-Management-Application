import React, { useState, useEffect } from 'react';
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
  Switch
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
  Today as TodayIcon
} from '@mui/icons-material';
// Import Firebase components (kept for future use)
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../firebase';
import { format, isPast, parseISO, isAfter, isBefore, subDays, addDays } from 'date-fns';
import { utils as xlsxUtils, writeFile } from 'xlsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Extended dummy data with more students and batches (using Indian Rupees)
const dummyStudents = [
  // Batch 2024A
  { id: '1', name: 'John Doe', batch: '2024A', feesMonth: '2024-02-15', amount: 45000, status: 'Paid' },
  { id: '2', name: 'Jane Smith', batch: '2024A', feesMonth: '2024-01-15', amount: 45000, status: 'Unpaid' },
  { id: '3', name: 'Alice Johnson', batch: '2024A', feesMonth: '2024-02-15', amount: 45000, status: 'Paid' },
  { id: '10', name: 'Peter Parker', batch: '2024A', feesMonth: '2024-03-15', amount: 45000, status: 'Unpaid' },
  // Batch 2024B
  { id: '4', name: 'Mike Johnson', batch: '2024B', feesMonth: '2024-02-15', amount: 52000, status: 'Paid' },
  { id: '5', name: 'Sarah Williams', batch: '2024B', feesMonth: '2024-01-15', amount: 52000, status: 'Unpaid' },
  { id: '6', name: 'Tom Wilson', batch: '2024B', feesMonth: '2024-03-15', amount: 52000, status: 'Unpaid' },
  { id: '11', name: 'Mary Jane', batch: '2024B', feesMonth: '2024-02-15', amount: 52000, status: 'Paid' },
  // Batch 2024C
  { id: '7', name: 'Robert Brown', batch: '2024C', feesMonth: '2024-03-15', amount: 48000, status: 'Unpaid' },
  { id: '8', name: 'Emily Davis', batch: '2024C', feesMonth: '2024-02-15', amount: 48000, status: 'Paid' },
  { id: '9', name: 'James Miller', batch: '2024C', feesMonth: '2024-01-15', amount: 48000, status: 'Paid' },
  { id: '12', name: 'David Clark', batch: '2024C', feesMonth: '2024-03-15', amount: 48000, status: 'Unpaid' },
  // Batch 2024D
  { id: '13', name: 'Lisa Anderson', batch: '2024D', feesMonth: '2024-02-15', amount: 50000, status: 'Paid' },
  { id: '14', name: 'Kevin White', batch: '2024D', feesMonth: '2024-03-15', amount: 50000, status: 'Unpaid' },
  { id: '15', name: 'Susan Brown', batch: '2024D', feesMonth: '2024-01-15', amount: 50000, status: 'Paid' }
];

// Format currency in Indian Rupees
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

// Styled components for the logo
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

// Create Alert component
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Create separate dialog components
const AddStudentDialog = React.memo(({ 
  open, 
  onClose, 
  onAdd, 
  uniqueBatches, 
  newStudent, 
  onInputChange 
}) => (
  <Dialog 
    open={open} 
    onClose={onClose}
    maxWidth="sm"
    fullWidth
  >
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
        <TextField
          select
          name="batch"
          label="Batch"
          fullWidth
          value={newStudent.batch}
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
      <Button onClick={onClose}>Cancel</Button>
      <Button 
        onClick={onAdd}
        variant="contained"
        disabled={!newStudent.name || !newStudent.batch || !newStudent.amount}
      >
        Add Student
      </Button>
    </DialogActions>
  </Dialog>
));

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

const AttendanceView = React.memo(({ students, uniqueBatches }) => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [attendanceData, setAttendanceData] = useState({});
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

  // Initialize attendance data for selected date if not exists
  useEffect(() => {
    if (!attendanceData[selectedDate]) {
      const initialAttendance = {};
      students.forEach(student => {
        initialAttendance[student.id] = 'absent';
      });
      setAttendanceData(prev => ({
        ...prev,
        [selectedDate]: initialAttendance
      }));
    }
    setShowingDate(format(parseISO(selectedDate), 'MMMM dd, yyyy'));
  }, [selectedDate, students]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleBatchChange = (event) => {
    setSelectedBatch(event.target.value);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [studentId]: status
      }
    }));
  };

  const getAttendanceStats = (date = selectedDate, batch = selectedBatch) => {
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
    const exportData = [];
    const dateArray = [];
    let currentDate = parseISO(dateRange.start);
    
    while (!isAfter(currentDate, parseISO(dateRange.end))) {
      dateArray.push(format(currentDate, 'yyyy-MM-dd'));
      currentDate = addDays(currentDate, 1);
    }

    students.forEach(student => {
      const studentData = {
        'Student Name': student.name,
        'Batch': student.batch,
      };

      dateArray.forEach(date => {
        const status = attendanceData[date]?.[student.id] || 'absent';
        studentData[format(parseISO(date), 'MMM dd, yyyy')] = status;
      });

      exportData.push(studentData);
    });

    const ws = xlsxUtils.json_to_sheet(exportData);
    const wb = xlsxUtils.book_new();
    xlsxUtils.book_append_sheet(wb, ws, 'Attendance Report');
    writeFile(wb, 'attendance_report.xlsx');
    handleExportClose();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Attendance Report', 14, 15);
    doc.setFontSize(12);
    doc.text(`Period: ${format(parseISO(dateRange.start), 'MMM dd, yyyy')} to ${format(parseISO(dateRange.end), 'MMM dd, yyyy')}`, 14, 25);

    // Add summary
    const stats = getAttendanceStats();
    const summaryData = [
      ['Total Students', stats.total],
      ['Average Attendance', `${stats.percentage}%`],
      ['Selected Batch', selectedBatch === 'all' ? 'All Batches' : `Batch ${selectedBatch}`]
    ];

    doc.autoTable({
      head: [['Metric', 'Value']],
      body: summaryData,
      startY: 35,
    });

    // Add attendance data
    const tableData = students
      .filter(s => selectedBatch === 'all' || s.batch === selectedBatch)
      .map(student => [
        student.name,
        student.batch,
        attendanceData[selectedDate]?.[student.id] || 'absent'
      ]);

    doc.autoTable({
      head: [['Student Name', 'Batch', 'Status']],
      body: tableData,
      startY: doc.lastAutoTable.finalY + 10,
    });

    doc.save('attendance_report.pdf');
    handleExportClose();
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

  const handleBulkAttendance = (status) => {
    const updatedAttendance = { ...attendanceData[selectedDate] };
    selectedStudents.forEach(studentId => {
      updatedAttendance[studentId] = status;
    });
    setAttendanceData(prev => ({
      ...prev,
      [selectedDate]: updatedAttendance
    }));
    setSelectedStudents([]);
    setSnackbar({
      open: true,
      message: `Marked ${selectedStudents.length} students as ${status}`,
      severity: 'success'
    });
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

  const DailyView = () => {
    const stats = getAttendanceStats();
    const filteredStudents = students.filter(student => 
      (selectedBatch === 'all' || student.batch === selectedBatch) &&
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const currentTime = new Date();
    const isLateAttendance = currentTime.getHours() >= 12; // Consider attendance after noon as late

    return (
      <>
        {/* Enhanced Controls Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Select Batch</InputLabel>
              <Select
                value={selectedBatch}
                label="Select Batch"
                onChange={handleBatchChange}
              >
                <MenuItem value="all">All Batches</MenuItem>
                {uniqueBatches.map((batch) => (
                  <MenuItem key={batch} value={batch}>
                    Batch {batch}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search Students"
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
            <FormControlLabel
              control={
                <Switch
                  checked={showLateAttendance}
                  onChange={(e) => setShowLateAttendance(e.target.checked)}
                />
              }
              label="Show Late Attendance Alerts"
            />
          </Grid>
        </Grid>

        {/* Enhanced Statistics Cards */}
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

        {/* Bulk Actions */}
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

        {/* Enhanced Attendance Table */}
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
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };

  const HistoryView = () => (
    <>
      {/* History & Analytics View */}
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
                      formatter={(value, name) => {
                        if (name === 'percentage') return `${value}%`;
                        return value;
                      }}
                      labelFormatter={(date) => format(parseISO(date), 'MMMM dd, yyyy')}
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

      {/* Batch-wise Summary */}
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

      {/* Export Menu */}
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

      {/* Notifications */}
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

const FeesDashboard = () => {
  const [students, setStudents] = useState([]);
  const [openReminder, setOpenReminder] = useState(false);
  const [overdueStudents, setOverdueStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('3');
  const [selectedTab, setSelectedTab] = useState(0);
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Firebase code (kept for future use)
    // const fetchStudents = async () => {
    //   const querySnapshot = await getDocs(collection(db, 'students'));
    //   const studentsData = querySnapshot.docs.map(doc => ({
    //     id: doc.id,
    //     ...doc.data()
    //   }));
    //   setStudents(studentsData);
    //   
    //   const overdue = studentsData.filter(student => {
    //     return student.status === 'Unpaid' && isPast(parseISO(student.feesMonth));
    //   });
    //   
    //   if (overdue.length > 0) {
    //     setOverdueStudents(overdue);
    //     setOpenReminder(true);
    //   }
    // };
    // fetchStudents();

    // Using dummy data instead
    setStudents(dummyStudents);
    const overdue = dummyStudents.filter(student => {
      return student.status === 'Unpaid' && isPast(parseISO(student.feesMonth));
    });
    
    if (overdue.length > 0) {
      setOverdueStudents(overdue);
      setOpenReminder(true);
    }
  }, []);

  // Sort function
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortStudents = (students) => {
    return students.sort((a, b) => {
      let compareResult = 0;
      switch (orderBy) {
        case 'name':
          compareResult = a.name.localeCompare(b.name);
          break;
        case 'batch':
          compareResult = a.batch.localeCompare(b.batch);
          break;
        case 'feesMonth':
          compareResult = isAfter(parseISO(a.feesMonth), parseISO(b.feesMonth)) ? 1 : -1;
          break;
        case 'amount':
          compareResult = a.amount - b.amount;
          break;
        case 'status':
          compareResult = a.status.localeCompare(b.status);
          break;
        default:
          compareResult = 0;
      }
      return order === 'asc' ? compareResult : -compareResult;
    });
  };

  // Filter students based on search query and selected filters
  useEffect(() => {
    let filtered = [...students];
    
    // Apply batch filter
    if (selectedBatch !== 'all') {
      filtered = filtered.filter(student => student.batch === selectedBatch);
    }
    
    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(student => student.status === selectedStatus);
    }

    // Apply month filter
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(student => {
        const studentMonth = format(parseISO(student.feesMonth), 'MMMM yyyy');
        return studentMonth === selectedMonth;
      });
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered = sortStudents(filtered);
    
    setFilteredStudents(filtered);
  }, [students, searchQuery, selectedBatch, selectedStatus, selectedMonth, order, orderBy]);

  const handleCloseReminder = () => {
    setOpenReminder(false);
  };

  const getRowStyle = (status, feesMonth) => {
    if (status === 'Unpaid' && isPast(parseISO(feesMonth))) {
      return { backgroundColor: '#ffebee' }; // Light red background for overdue
    }
    return {};
  };

  // Get unique values for filters
  const uniqueBatches = [...new Set(students.map(student => student.batch))].sort();
  const uniqueMonths = [...new Set(students.map(student => 
    format(parseISO(student.feesMonth), 'MMMM yyyy')
  ))].sort();

  // Calculate statistics based on filtered students
  const totalStudents = filteredStudents.length;
  const totalFees = filteredStudents.reduce((sum, student) => sum + student.amount, 0);
  const paidStudents = filteredStudents.filter(s => s.status === 'Paid').length;
  const collectionRate = totalStudents ? (paidStudents / totalStudents) * 100 : 0;

  // Calculate batch-wise summary
  const getBatchSummary = () => {
    const summary = {};
    students.forEach(student => {
      if (!summary[student.batch]) {
        summary[student.batch] = {
          batch: student.batch,
          totalStudents: 0,
          feesCollected: 0,
          pendingAmount: 0,
          totalAmount: 0
        };
      }
      summary[student.batch].totalStudents += 1;
      summary[student.batch].totalAmount += student.amount;
      if (student.status === 'Paid') {
        summary[student.batch].feesCollected += student.amount;
      } else {
        summary[student.batch].pendingAmount += student.amount;
      }
    });

    // Calculate collection rate for each batch
    Object.values(summary).forEach(batch => {
      batch.collectionRate = (batch.feesCollected / batch.totalAmount) * 100;
    });

    return Object.values(summary);
  };

  // Prepare data for charts
  const batchSummary = getBatchSummary();
  
  const chartData = batchSummary.map(batch => ({
    name: `Batch ${batch.batch}`,
    collected: batch.feesCollected,
    pending: batch.pendingAmount
  }));

  const pieChartData = [
    { name: 'Paid', value: filteredStudents.filter(s => s.status === 'Paid').length },
    { name: 'Unpaid', value: filteredStudents.filter(s => s.status === 'Unpaid').length }
  ];

  // Calculate monthly trends
  const getMonthlyTrends = () => {
    const monthlyData = {};
    students.forEach(student => {
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
      monthlyData[month].totalFees += student.amount;
      monthlyData[month].totalStudents += 1;
      if (student.status === 'Paid') {
        monthlyData[month].collectedFees += student.amount;
        monthlyData[month].paidStudents += 1;
      } else {
        monthlyData[month].pendingFees += student.amount;
      }
    });

    return Object.values(monthlyData).sort((a, b) => 
      parseISO(a.month) - parseISO(b.month)
    ).slice(-parseInt(selectedTimeRange));
  };

  // Export functions
  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const exportToExcel = () => {
    const exportData = filteredStudents.map(student => ({
      'Student Name': student.name,
      'Batch': student.batch,
      'Month': format(parseISO(student.feesMonth), 'MMMM yyyy'),
      'Fees Amount': formatCurrency(student.amount),
      'Status': student.status
    }));

    const ws = xlsxUtils.json_to_sheet(exportData);
    const wb = xlsxUtils.book_new();
    xlsxUtils.book_append_sheet(wb, ws, 'Fees Data');
    writeFile(wb, 'fees_report.xlsx');
    handleExportClose();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Fees Collection Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on ${format(new Date(), 'dd/MM/yyyy')}`, 14, 25);

    // Add batch summary
    const batchSummaryData = batchSummary.map(batch => [
      `Batch ${batch.batch}`,
      batch.totalStudents,
      formatCurrency(batch.feesCollected),
      formatCurrency(batch.pendingAmount),
      `${Math.round(batch.collectionRate)}%`
    ]);

    doc.autoTable({
      head: [['Batch', 'Students', 'Collected', 'Pending', 'Collection Rate']],
      body: batchSummaryData,
      startY: 35,
    });

    // Add student details
    const studentData = filteredStudents.map(student => [
      student.name,
      student.batch,
      format(parseISO(student.feesMonth), 'MMM yyyy'),
      formatCurrency(student.amount),
      student.status
    ]);

    doc.autoTable({
      head: [['Name', 'Batch', 'Month', 'Amount', 'Status']],
      body: studentData,
      startY: doc.lastAutoTable.finalY + 10,
    });

    doc.save('fees_report.pdf');
    handleExportClose();
  };

  const exportToCSV = () => {
    const exportData = filteredStudents.map(student => 
      `${student.name},${student.batch},${format(parseISO(student.feesMonth), 'MMMM yyyy')},${student.amount},${student.status}`
    ).join('\n');
    
    const header = 'Student Name,Batch,Month,Amount,Status\n';
    const blob = new Blob([header + exportData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fees_report.csv';
    a.click();
    handleExportClose();
  };

  const monthlyTrends = getMonthlyTrends();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerWidth = 240;

  const drawer = (
    <Box sx={{ overflow: 'auto' }}>
      <Logo />
      <Divider />
      <List>
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
        <ListItem button selected={selectedTab === 2} onClick={() => setSelectedTab(2)}>
          <ListItemIcon>
            <TodayIcon />
          </ListItemIcon>
          <ListItemText primary="Attendance" />
        </ListItem>
      </List>
    </Box>
  );

  const DetailedView = React.memo(() => (
    <>
      {/* Search and Filter Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
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
                  Batch {batch}
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

      {/* Add Student FAB */}
      <Fab 
        color="primary" 
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16 
        }}
        onClick={handleAddDialogOpen}
        aria-label="add student"
      >
        <AddIcon />
      </Fab>

      {/* Students Table */}
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
            {filteredStudents.map((student) => (
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
                        onClick={() => handleEditDialogOpen(student)}
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
                        onClick={() => handleDeleteStudent(student)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No students found matching your search criteria
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Export Menu */}
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
        <MenuItem onClick={exportToCSV}>
          <ListItemIcon>
            <InsertDriveFileOutlined />
          </ListItemIcon>
          Export to CSV
        </MenuItem>
      </Menu>
    </>
  ));

  const VisualizationsView = () => (
    <>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={totalStudents}
            icon={<GroupOutlined sx={{ color: '#1976d2' }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Fees"
            value={`$${totalFees}`}
            icon={<PaidOutlined sx={{ color: '#2e7d32' }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Overdue"
            value={overdueStudents.length}
            icon={<WarningAmberOutlined sx={{ color: '#d32f2f' }} />}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Collection Rate"
            value={`${Math.round(collectionRate)}%`}
            icon={<TrendingUpOutlined sx={{ color: '#7b1fa2' }} />}
            color="#7b1fa2"
          />
        </Grid>
      </Grid>

      {/* Batch Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {batchSummary.map((batch) => (
          <Grid item xs={12} sm={6} md={3} key={batch.batch}>
            <BatchSummaryCard batchData={batch} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Monthly Collection Trends</Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                  >
                    <MenuItem value="3">Last 3 Months</MenuItem>
                    <MenuItem value="6">Last 6 Months</MenuItem>
                    <MenuItem value="12">Last 12 Months</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="collectedFees" 
                      name="Collected" 
                      stackId="1"
                      fill="#00C49F" 
                      stroke="#00C49F"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pendingFees" 
                      name="Pending" 
                      stackId="1"
                      fill="#FF8042" 
                      stroke="#FF8042"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Collection Rate by Batch
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={batchSummary}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis dataKey="batch" type="category" />
                    <RechartsTooltip formatter={(value) => `${value}%`} />
                    <Bar 
                      dataKey="collectionRate" 
                      fill="#8884d8"
                      name="Collection Rate"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Student Payment Status
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="paidStudents" 
                      name="Paid Students" 
                      stroke="#00C49F"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalStudents" 
                      name="Total Students" 
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );

  // Add Student Dialog handlers
  const handleAddDialogOpen = () => {
    setOpenAddDialog(true);
  };

  const handleAddDialogClose = () => {
    setOpenAddDialog(false);
    setNewStudent({
      name: '',
      batch: '',
      feesMonth: format(new Date(), 'yyyy-MM-dd'),
      amount: '',
      status: 'Unpaid'
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewStudent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStudent = () => {
    const newId = (Math.max(...students.map(s => parseInt(s.id, 10))) + 1).toString();
    
    const formattedStudent = {
      ...newStudent,
      id: newId,
      amount: parseFloat(newStudent.amount)
    };

    setStudents(prev => [...prev, formattedStudent]);
    handleAddDialogClose();
    setSnackbar({
      open: true,
      message: `Student ${formattedStudent.name} has been successfully added`,
      severity: 'success'
    });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleEditDialogOpen = (student) => {
    setSelectedStudent(student);
    setEditStudent({
      name: student.name,
      batch: student.batch,
      feesMonth: student.feesMonth,
      amount: student.amount,
      status: student.status
    });
    setOpenEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setSelectedStudent(null);
    setEditStudent({
      name: '',
      batch: '',
      feesMonth: '',
      amount: '',
      status: ''
    });
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setEditStudent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateStudent = () => {
    setStudents(prev => prev.map(student => 
      student.id === selectedStudent.id 
        ? { ...student, ...editStudent }
        : student
    ));
    handleEditDialogClose();
    setSnackbar({
      open: true,
      message: `Student ${editStudent.name}'s details have been updated`,
      severity: 'success'
    });
  };

  const handleMarkAsPaid = (student) => {
    setStudents(prev => prev.map(s => 
      s.id === student.id 
        ? { ...s, status: 'Paid' }
        : s
    ));
    setSnackbar({
      open: true,
      message: `${student.name}'s fees has been marked as paid`,
      severity: 'success'
    });
  };

  const handleDeleteStudent = (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.name}'s record?`)) {
      setStudents(prev => prev.filter(s => s.id !== student.id));
      setSnackbar({
        open: true,
        message: `${student.name}'s record has been deleted`,
        severity: 'info'
      });
    }
  };

  const mainContent = () => {
    switch(selectedTab) {
      case 0:
        return <DetailedView />;
      case 1:
        return <VisualizationsView />;
      case 2:
        return <AttendanceView students={students} uniqueBatches={uniqueBatches} />;
      default:
        return <DetailedView />;
    }
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
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {selectedTab === 0 ? 'Detailed View' : selectedTab === 1 ? 'Visualizations' : 'Attendance'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
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
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        {mainContent()}
      </Box>

      {/* Reminder Dialog */}
      <Dialog 
        open={openReminder} 
        onClose={handleCloseReminder}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 300
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#ffebee', color: '#d32f2f' }}>
          Fees Payment Reminder
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2, mb: 2 }}>
            The following students have overdue fees:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            {overdueStudents.map((student) => (
              <li key={student.id}>
                <Typography color="error">
                  {student.name} - {format(parseISO(student.feesMonth), 'MMMM yyyy')}
                </Typography>
              </li>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReminder} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Student Dialog */}
      <AddStudentDialog
        open={openAddDialog}
        onClose={handleAddDialogClose}
        onAdd={handleAddStudent}
        uniqueBatches={uniqueBatches}
        newStudent={newStudent}
        onInputChange={handleInputChange}
      />

      {/* Edit Student Dialog */}
      <EditStudentDialog
        open={openEditDialog}
        onClose={handleEditDialogClose}
        onUpdate={handleUpdateStudent}
        uniqueBatches={uniqueBatches}
        editStudent={editStudent}
        onInputChange={handleEditInputChange}
      />

      {/* Success Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default FeesDashboard; 