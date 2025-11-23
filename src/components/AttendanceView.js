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
  TextField,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Menu,
  ListItemIcon,
  Snackbar,
  Alert as MuiAlert,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  PictureAsPdfOutlined,
  TableChart as TableChartIcon,
  CalendarToday as CalendarIcon,
  PersonOutline as PersonIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { format, parseISO, getDaysInMonth, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval } from 'date-fns';
import * as XLSX from 'xlsx';
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
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    return startOfWeek(today, { weekStartsOn: 1 }); // Monday as start of week
  });
  const [selectedBatch, setSelectedBatch] = useState(() => {
    // Set default to first batch if available, otherwise 'all'
    const batches = allBatches.map(batch => batch.name || batch).filter(Boolean);
    return batches.length > 0 ? batches[0] : 'all';
  });
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
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

  // Calculate week days
  const weekDays = useMemo(() => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
  }, [currentWeekStart]);

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

  // Fetch attendance for the week
  const fetchWeekAttendance = useCallback(async (weekStart, batch) => {
    if (!weekStart) return;
    
    setIsLoadingAttendance(true);
    try {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const startDate = format(weekStart, 'yyyy-MM-dd');
      const endDate = format(weekEnd, 'yyyy-MM-dd');
      
      // Fetch attendance for the week
      const data = await api.getAttendanceRange(startDate, endDate, batch);
      
      const weekAttendanceMap = {};
      data.forEach(record => {
        const date = format(parseISO(record.date), 'yyyy-MM-dd');
        if (!weekAttendanceMap[date]) {
          weekAttendanceMap[date] = {};
        }
        weekAttendanceMap[date][record.studentId] = record.status;
      });
      
      setAttendanceData(prev => ({
        ...prev,
        ...weekAttendanceMap
      }));
    } catch (error) {
      console.error('Error fetching week attendance:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch attendance data',
        severity: 'error'
      });
    } finally {
      setIsLoadingAttendance(false);
    }
  }, [setAttendanceData, setIsLoadingAttendance]);

  // Handle week navigation
  const handlePreviousWeek = useCallback(() => {
    setCurrentWeekStart(prev => subWeeks(prev, 1));
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  }, []);

  // Memoize handleAttendanceChange function
  const handleAttendanceChange = useCallback(async (studentId, dateOrDay, status) => {
    // Handle both date string (from weekly view) and day number (from monthly view)
    let date;
    let attendanceDate;
    
    if (typeof dateOrDay === 'string') {
      // Weekly view - date is already a string
      date = dateOrDay;
      attendanceDate = parseISO(date);
    } else {
      // Monthly view - day is a number
      date = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dateOrDay), 'yyyy-MM-dd');
      attendanceDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dateOrDay);
    }
    
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today to allow marking for today
    
    // Prevent marking attendance for future dates
    if (attendanceDate > today) {
      console.warn('Cannot mark attendance for future dates');
      return;
    }
    
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
  }, [selectedBatch, students, setAttendanceData, setIsLoadingAttendance, currentMonth]);


  // Memoize handleBatchChange function
  const handleBatchChange = useCallback((event) => {
    const newBatch = event.target.value;
    setSelectedBatch(newBatch);
  }, []);


  // Fetch attendance data when week changes
  useEffect(() => {
    fetchWeekAttendance(currentWeekStart, selectedBatch);
  }, [currentWeekStart, selectedBatch, fetchWeekAttendance]);

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

  const getStudentAttendanceForDate = (studentId, date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return attendanceData[dateStr]?.[studentId] || 'absent';
  };

  // Get weekly attendance stats
  const getWeeklyStats = useCallback(() => {
    const filteredStudents = students.filter(student => 
      selectedBatch === 'all' ||
      (student.batch?.name || student.batch) === selectedBatch
    );

    let totalDays = 0;
    let totalPresent = 0;

    weekDays.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayAttendance = attendanceData[dateStr] || {};
      totalDays += filteredStudents.length;
      totalPresent += filteredStudents.filter(s => 
        dayAttendance[s.id] === 'present'
      ).length;
    });

    return {
      total: totalDays,
      present: totalPresent,
      absent: totalDays - totalPresent,
      percentage: totalDays ? Math.round((totalPresent / totalDays) * 100) : 0
    };
  }, [weekDays, attendanceData, students, selectedBatch]);

  const weeklyStats = getWeeklyStats();

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
        'Total Days': studentStats.total
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
        `${studentStats.present}/${studentStats.total}`
      ];
      
      // Add individual day attendance
      for (let day = 1; day <= daysInMonth; day++) {
        const attendance = getStudentAttendanceForDay(student.id, day);
        row.push(attendance === 'present' ? 'P' : 'A');
      }
      
      tableData.push(row);
    });

    // Create table headers
    const headers = ['Name', 'Batch', 'Present/Total'];
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


  const WeeklyView = () => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    
    return (
      <Box>
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
                    Week of {format(currentWeekStart, 'MMM dd')}
                  </Typography>
                </Box>
                <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  Selected Week
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
                    {weeklyStats.present}
                    <Typography component="span" variant="body2" sx={{ ml: 1, fontSize: '0.75rem' }}>
                      ({weeklyStats.percentage}%)
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
                    {weeklyStats.absent}
                    <Typography component="span" variant="body2" sx={{ ml: 1, fontSize: '0.75rem' }}>
                      ({Math.round((weeklyStats.absent / weeklyStats.total) * 100)}%)
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
            <Button
              variant="outlined"
              onClick={handlePreviousWeek}
              disabled={isLoadingAttendance}
              startIcon={<ChevronLeftIcon />}
              sx={{
                minWidth: 100,
                fontWeight: 'bold',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
            >
              Previous
            </Button>
            <Typography variant="body1" sx={{ minWidth: 200, textAlign: 'center', fontWeight: 500 }}>
              {format(currentWeekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
            </Typography>
            <Button
              variant="outlined"
              onClick={handleNextWeek}
              disabled={isLoadingAttendance}
              endIcon={<ChevronRightIcon />}
              sx={{
                minWidth: 100,
                fontWeight: 'bold',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
            >
              Next
            </Button>
          </Box>

          {isLoadingAttendance && (
            <CircularProgress size={20} />
          )}
        </Box>

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
                {weekDays.map((day) => (
                  <TableCell 
                    key={format(day, 'yyyy-MM-dd')} 
                    align="center" 
                    sx={{ 
                      minWidth: 80, 
                      maxWidth: 80, 
                      padding: '8px 4px',
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.background.default,
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      color: theme.palette.text.primary,
                      fontWeight: 'bold'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 'bold', display: 'block' }}>
                      {format(day, 'EEE')}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                      {format(day, 'MMM dd')}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => {
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
                    {weekDays.map((day) => {
                      const attendance = getStudentAttendanceForDate(student.id, day);
                      const today = new Date();
                      today.setHours(23, 59, 59, 999);
                      const isToday = format(new Date(), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                      const isFutureDate = day > today;
                      
                      const tooltipContent = isFutureDate 
                        ? `${format(day, 'MMM dd, yyyy')} - Future date (cannot mark attendance)`
                        : `${format(day, 'MMM dd, yyyy')} - Click to mark ${attendance === 'present' ? 'absent' : 'present'}`;
                      
                      return (
                        <TableCell 
                          key={format(day, 'yyyy-MM-dd')} 
                          align="center" 
                          sx={{ 
                            padding: '4px',
                            border: `1px solid ${theme.palette.divider}`,
                            cursor: isFutureDate ? 'not-allowed' : 'pointer',
                            backgroundColor: attendance === 'present' ? '#4caf50' : '#f44336',
                            opacity: isFutureDate ? 0.6 : 1,
                            '&:hover': {
                              backgroundColor: isFutureDate 
                                ? (attendance === 'present' ? '#4caf50' : '#f44336')
                                : (attendance === 'present' ? '#45a049' : '#d32f2f'),
                              opacity: isFutureDate ? 0.6 : 0.8
                            }
                          }}
                          onClick={() => {
                            if (!isFutureDate) {
                              handleAttendanceChange(student.id, format(day, 'yyyy-MM-dd'), attendance === 'present' ? 'absent' : 'present');
                            }
                          }}
                        >
                          <Tooltip title={tooltipContent}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                                border: isToday ? '2px solid #000' : 'none',
                                backgroundColor: attendance === 'present' ? '#4caf50' : '#f44336',
                                color: 'white',
                                fontSize: '0.7rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {attendance === 'present' ? 'P' : 'A'}
                            </Box>
                          </Tooltip>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={weekDays.length + 1} align="center" sx={{ py: 3 }}>
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

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel size="small">Month</InputLabel>
          <Select
            value={selectedMonth}
            label="Month"
            onChange={(e) => setSelectedMonth(e.target.value)}
            disabled={isLoadingAttendance}
            size="small"
          >
            {(() => {
              const months = [];
              const currentDate = new Date();
              for (let i = 0; i < 12; i++) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const monthStr = format(date, 'yyyy-MM');
                months.push({
                  value: monthStr,
                  label: format(date, 'MMMM yyyy')
                });
              }
              return months.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ));
            })()}
          </Select>
        </FormControl>


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
                    const attendanceDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const today = new Date();
                    today.setHours(23, 59, 59, 999);
                    const isToday = format(new Date(), 'yyyy-MM-dd') === format(attendanceDate, 'yyyy-MM-dd');
                    const isFutureDate = attendanceDate > today;
                    
                    // Create appropriate tooltip content
                    const tooltipContent = isFutureDate 
                      ? `${format(attendanceDate, 'MMM dd, yyyy')} - Future date (cannot mark attendance)`
                      : `${format(attendanceDate, 'MMM dd, yyyy')} - Click to mark ${attendance === 'present' ? 'absent' : 'present'}`;
                    
                    return (
                                             <TableCell 
                         key={day} 
                         align="center" 
                         sx={{ 
                           padding: '1px',
                           border: `1px solid ${theme.palette.divider}`,
                           cursor: isFutureDate ? 'not-allowed' : 'pointer',
                           backgroundColor: attendance === 'present' ? '#4caf50' : '#f44336',
                           opacity: isFutureDate ? 0.6 : 1,
                           '&:hover': {
                             backgroundColor: isFutureDate 
                               ? (attendance === 'present' ? '#4caf50' : '#f44336')
                               : (attendance === 'present' ? '#45a049' : '#d32f2f'),
                             opacity: isFutureDate ? 0.6 : 0.8
                           }
                         }}
                         onClick={() => {
                          if (!isFutureDate) {
                            handleAttendanceChange(student.id, day, attendance === 'present' ? 'absent' : 'present');
                          }
                        }}
                       >
                         <Tooltip title={tooltipContent}>
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
                </TableRow>
              );
            })}
            {filteredStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={daysInMonth + 1} align="center" sx={{ py: 3 }}>
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


  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Attendance Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportClick}
        >
          Export Report
        </Button>
      </Box>

      <WeeklyView />

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