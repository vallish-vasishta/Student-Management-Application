import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  FormControl,
  Select,
  InputLabel,
  Menu,
  ListItemIcon,
  Stack,
  Snackbar,
  Alert as MuiAlert,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  TableChartOutlined,
  PictureAsPdfOutlined,
  TableChart as TableChartIcon,
  CheckCircle as CheckCircleIcon,
  CalendarToday as CalendarIcon,
  PersonOutline as PersonIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { format, parseISO, isAfter, subDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval, getDaysInMonth, getMonth, getYear } from 'date-fns';
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Utility to check for valid date string
function isValidDateString(date) {
  return date && !isNaN(new Date(date));
}

const AttendanceView = React.memo(({ 
  students, 
  uniqueBatches, 
  batchSummary, 
  attendanceData, 
  setAttendanceData, 
  isLoadingAttendance, 
  setIsLoadingAttendance, 
  allBatches = [] 
}) => {
  const theme = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [viewMode, setViewMode] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Get current month info
  const currentMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    return new Date(year, month - 1, 1);
  }, [selectedMonth]);

  const daysInMonth = useMemo(() => {
    return getDaysInMonth(currentMonth);
  }, [currentMonth]);

  const monthDays = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  // Add getBatches function
  const getBatches = useCallback(() => {
    const batchNames = allBatches.map(batch => batch.name || batch).filter(Boolean);
    return batchNames.sort();
  }, [allBatches]);

  // Memoize fetchAttendance function for the entire month
  const fetchMonthAttendance = useCallback(async (yearMonth, batch) => {
    if (!yearMonth) return;
    
    setIsLoadingAttendance(true);
    try {
      const [year, month] = yearMonth.split('-').map(Number);
      const startDate = format(new Date(year, month - 1, 1), 'yyyy-MM-dd');
      const endDate = format(new Date(year, month, 0), 'yyyy-MM-dd');
      
      // Fetch attendance for the entire month
      const data = await api.getAttendanceRange(startDate, endDate, batch);
      
      const monthAttendanceMap = {};
      data.forEach(record => {
        const date = format(parseISO(record.date), 'yyyy-MM-dd');
        if (!monthAttendanceMap[date]) {
          monthAttendanceMap[date] = {};
        }
        monthAttendanceMap[date][record.studentId] = record.status;
      });
      
      setAttendanceData(prev => ({
        ...prev,
        ...monthAttendanceMap
      }));
    } catch (error) {
      console.error('Error fetching month attendance:', error);
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
  const handleAttendanceChange = useCallback(async (studentId, day, status) => {
    const date = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), 'yyyy-MM-dd');
    
    setIsLoadingAttendance(true);
    try {
      const records = [{
        studentId,
        status,
        batch: students.find(s => s.id === studentId)?.batch || selectedBatch
      }];

      const response = await api.markAttendance(date, records);
      
      // Update local state after successful API call
      setAttendanceData(prev => ({
        ...prev,
        [date]: {
          ...prev[date],
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
  }, [currentMonth, selectedBatch, students, setAttendanceData, setIsLoadingAttendance]);

  // Memoize handleMonthChange function
  const handleMonthChange = useCallback((event) => {
    const newMonth = event.target.value;
    setSelectedMonth(newMonth);
  }, []);

  // Memoize handleBatchChange function
  const handleBatchChange = useCallback((event) => {
    const newBatch = event.target.value;
    setSelectedBatch(newBatch);
  }, []);

  // Navigate to previous/next month
  const navigateMonth = useCallback((direction) => {
    const current = new Date(currentMonth);
    if (direction === 'prev') {
      current.setMonth(current.getMonth() - 1);
    } else {
      current.setMonth(current.getMonth() + 1);
    }
    setSelectedMonth(format(current, 'yyyy-MM'));
  }, [currentMonth]);

  // Fetch attendance data when month changes
  useEffect(() => {
    fetchMonthAttendance(selectedMonth, selectedBatch);
  }, [selectedMonth, selectedBatch, fetchMonthAttendance]);

  const getAttendanceStats = (month = selectedMonth, batch = selectedBatch) => {
    if (!month) {
      return { total: 0, present: 0, absent: 0, percentage: 0 };
    }

    const [year, monthNum] = month.split('-').map(Number);
    const startDate = format(new Date(year, monthNum - 1, 1), 'yyyy-MM-dd');
    const endDate = format(new Date(year, monthNum, 0), 'yyyy-MM-dd');
    
    const filteredStudents = students.filter(s => 
      selectedBatch === 'all' || s.batch === batch
    );
    
    let totalDays = 0;
    let totalPresent = 0;
    
    // Calculate attendance for each day in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = format(new Date(year, monthNum - 1, day), 'yyyy-MM-dd');
      const dayAttendance = attendanceData[date] || {};
      
      totalDays += filteredStudents.length;
      totalPresent += filteredStudents.filter(s => 
        dayAttendance[s.id] === 'present'
      ).length;
    }
    
    return {
      total: totalDays,
      present: totalPresent,
      absent: totalDays - totalPresent,
      percentage: totalDays ? Math.round((totalPresent / totalDays) * 100) : 0
    };
  };

  const stats = getAttendanceStats();

  const filteredStudents = students.filter(student => 
    selectedBatch === 'all' ||
    (student.batch?.name || student.batch) === selectedBatch
  );

  const getStudentAttendanceForDay = (studentId, day) => {
    const date = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), 'yyyy-MM-dd');
    return attendanceData[date]?.[studentId] || 'absent';
  };

  const getStudentMonthlyStats = (studentId) => {
    let presentDays = 0;
    let totalDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), 'yyyy-MM-dd');
      const dayAttendance = attendanceData[date] || {};
      totalDays++;
      if (dayAttendance[studentId] === 'present') {
        presentDays++;
      }
    }
    
    return {
      present: presentDays,
      total: totalDays,
      percentage: totalDays ? Math.round((presentDays / totalDays) * 100) : 0
    };
  };

  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const exportToExcel = () => {
    handleExportClose();
    const workbook = XLSX.utils.book_new();
    
    // Create worksheet for monthly attendance data
    const attendanceData = [];
    
    filteredStudents.forEach(student => {
      const studentStats = getStudentMonthlyStats(student.id);
      const row = {
        'Name': student.name,
        'Batch': student.batch?.name || student.batch || '',
        'Present Days': studentStats.present,
        'Total Days': studentStats.total,
        'Attendance Rate': `${studentStats.percentage}%`
      };
      
      // Add individual day attendance
      for (let day = 1; day <= daysInMonth; day++) {
        const attendance = getStudentAttendanceForDay(student.id, day);
        row[`Day ${day}`] = attendance === 'present' ? 'P' : 'A';
      }
      
      attendanceData.push(row);
    });
    
    const ws = XLSX.utils.json_to_sheet(attendanceData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Monthly Attendance');

    // Save the file
    XLSX.writeFile(workbook, `attendance_report_${selectedMonth}.xlsx`);
    setSnackbar({ open: true, message: 'Report exported to Excel successfully', severity: 'success' });
  };

  const exportToPDF = () => {
    handleExportClose();
    const doc = new jsPDF('landscape');
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Monthly Attendance Report - ${format(currentMonth, 'MMMM yyyy')}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on ${format(new Date(), 'PPP')}`, 14, 30);

    // Create table data
    const tableData = [];
    
    filteredStudents.forEach(student => {
      const studentStats = getStudentMonthlyStats(student.id);
      const row = [
        student.name,
        student.batch?.name || student.batch || '',
        `${studentStats.present}/${studentStats.total}`,
        `${studentStats.percentage}%`
      ];
      
      // Add individual day attendance
      for (let day = 1; day <= daysInMonth; day++) {
        const attendance = getStudentAttendanceForDay(student.id, day);
        row.push(attendance === 'present' ? 'P' : 'A');
      }
      
      tableData.push(row);
    });

    // Create table headers
    const headers = ['Name', 'Batch', 'Present/Total', 'Rate'];
    for (let day = 1; day <= daysInMonth; day++) {
      headers.push(day.toString());
    }

    doc.autoTable({
      startY: 40,
      head: [headers],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [25, 118, 210] },
      styles: { fontSize: 8 }
    });

    // Save the PDF
    doc.save(`attendance_report_${selectedMonth}.pdf`);
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

  const MonthlyView = () => (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel size="small">Batch</InputLabel>
          <Select
            value={selectedBatch}
            label="Batch"
            onChange={handleBatchChange}
            disabled={isLoadingAttendance}
            size="small"
          >
            <MenuItem value="all">All Batches</MenuItem>
            {getBatches().map((batch) => (
              <MenuItem key={batch} value={batch}>
                {batch}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={() => navigateMonth('prev')} disabled={isLoadingAttendance}>
            <NavigateBeforeIcon />
          </IconButton>
          <TextField
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            disabled={isLoadingAttendance}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 120 }}
            size="small"
          />
          <IconButton size="small" onClick={() => navigateMonth('next')} disabled={isLoadingAttendance}>
            <NavigateNextIcon />
          </IconButton>
        </Box>

        {isLoadingAttendance && (
          <CircularProgress size={20} />
        )}
      </Box>

      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            p: 1,
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}>
            <CardContent sx={{ p: '8px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <CalendarIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                <Typography variant="body1" component="div" sx={{ fontSize: '0.9rem' }}>
                  {format(currentMonth, 'MMMM yyyy')}
                </Typography>
              </Box>
              <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Selected Month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            p: 1,
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}>
            <CardContent sx={{ p: '8px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <PersonIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                <Typography variant="body1" component="div" sx={{ fontSize: '0.9rem' }}>
                  {filteredStudents.length}
                </Typography>
              </Box>
              <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Total Students
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            p: 1,
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}>
            <CardContent sx={{ p: '8px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <PresentIcon sx={{ mr: 1, color: 'success.main', fontSize: '1.2rem' }} />
                <Typography variant="body1" component="div" sx={{ fontSize: '0.9rem' }}>
                  {stats.present}
                  <Typography component="span" variant="body2" sx={{ ml: 1, fontSize: '0.75rem' }}>
                    ({stats.percentage}%)
                  </Typography>
                </Typography>
              </Box>
              <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Total Present
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            p: 1,
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}>
            <CardContent sx={{ p: '8px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <AbsentIcon sx={{ mr: 1, color: 'error.main', fontSize: '1.2rem' }} />
                <Typography variant="body1" component="div" sx={{ fontSize: '0.9rem' }}>
                  {stats.absent}
                  <Typography component="span" variant="body2" sx={{ ml: 1, fontSize: '0.75rem' }}>
                    ({Math.round((stats.absent / stats.total) * 100)}%)
                  </Typography>
                </Typography>
              </Box>
              <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Total Absent
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.background.default }}>
              <TableCell sx={{ 
                minWidth: 150, 
                maxWidth: 150,
                position: 'sticky', 
                left: 0, 
                backgroundColor: theme.palette.background.default, 
                zIndex: 2,
                padding: '8px 4px',
                borderBottom: `2px solid ${theme.palette.divider}`,
                color: theme.palette.text.primary,
                fontWeight: 'bold'
              }}>
                Student Name
              </TableCell>
              {monthDays.map((day) => (
                <TableCell 
                  key={day} 
                  align="center" 
                  sx={{ 
                    minWidth: 28, 
                    maxWidth: 28, 
                    padding: '2px',
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.default,
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    color: theme.palette.text.primary,
                    fontWeight: 'bold'
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}>
                    {day}
                  </Typography>
                </TableCell>
              ))}
              <TableCell align="center" sx={{ 
                minWidth: 60, 
                maxWidth: 60, 
                padding: '4px',
                backgroundColor: theme.palette.background.default,
                position: 'sticky',
                top: 0,
                zIndex: 1,
                borderBottom: `2px solid ${theme.palette.divider}`,
                color: theme.palette.text.primary,
                fontWeight: 'bold'
              }}>
                Rate
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student) => {
              const studentStats = getStudentMonthlyStats(student.id);
              return (
                <TableRow key={student.id} hover>
                  <TableCell 
                    sx={{ 
                      position: 'sticky', 
                      left: 0, 
                      backgroundColor: theme.palette.background.paper, 
                      zIndex: 1,
                      borderRight: `2px solid ${theme.palette.divider}`,
                      padding: '8px 4px'
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem', lineHeight: 1.2 }}>
                        {student.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {student.batch?.name || student.batch || ''}
                      </Typography>
                    </Box>
                  </TableCell>
                  {monthDays.map((day) => {
                    const attendance = getStudentAttendanceForDay(student.id, day);
                    const isToday = format(new Date(), 'yyyy-MM-dd') === format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), 'yyyy-MM-dd');
                    
                    return (
                                             <TableCell 
                         key={day} 
                         align="center" 
                         sx={{ 
                           padding: '1px',
                           border: `1px solid ${theme.palette.divider}`,
                           cursor: 'pointer',
                           backgroundColor: attendance === 'present' ? '#4caf50' : '#f44336',
                           '&:hover': {
                             backgroundColor: attendance === 'present' ? '#45a049' : '#d32f2f',
                             opacity: 0.8
                           }
                         }}
                         onClick={() => handleAttendanceChange(student.id, day, attendance === 'present' ? 'absent' : 'present')}
                       >
                         <Tooltip title={`${format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), 'MMM dd, yyyy')} - Click to mark ${attendance === 'present' ? 'absent' : 'present'}`}>
                           <Box
                             sx={{
                               width: 20,
                               height: 20,
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               borderRadius: '3px',
                               border: isToday ? '2px solid #000' : 'none',
                               backgroundColor: attendance === 'present' ? '#4caf50' : '#f44336',
                               color: 'white',
                               fontSize: '0.6rem',
                               fontWeight: 'bold'
                             }}
                           >
                             {attendance === 'present' ? 'P' : 'A'}
                           </Box>
                         </Tooltip>
                       </TableCell>
                    );
                  })}
                  <TableCell align="center" sx={{ padding: '4px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1, fontSize: '0.75rem' }}>
                        {studentStats.percentage}%
                      </Typography>
                      <Box sx={{ width: 40 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={studentStats.percentage}
                          color={studentStats.percentage >= 75 ? 'success' : studentStats.percentage >= 50 ? 'warning' : 'error'}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={daysInMonth + 2} align="center" sx={{ py: 3 }}>
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
          <Card sx={{ 
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Attendance Trends
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getAttendanceHistory()}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <YAxis tick={{ fill: theme.palette.text.secondary }} />
                    <RechartsTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div style={{ 
                              backgroundColor: theme.palette.background.paper, 
                              padding: '10px', 
                              border: `1px solid ${theme.palette.divider}`,
                              color: theme.palette.text.primary,
                              borderRadius: 8
                            }}>
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
          <Card sx={{ 
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}>
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
            <ToggleButton value="monthly">
              Monthly View
            </ToggleButton>
            <ToggleButton value="history">
              History & Analytics
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {viewMode === 'monthly' ? <MonthlyView /> : <HistoryView />}

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

export default AttendanceView; 