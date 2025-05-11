import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import * as api from '../services/api';

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedBatch, setSelectedBatch] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedBatch && selectedDate) {
      fetchAttendance();
    }
  }, [selectedBatch, selectedDate]);

  const fetchStudents = async () => {
    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (error) {
      showSnackbar('Failed to fetch students', 'error');
    }
  };

  const fetchAttendance = async () => {
    try {
      const data = await api.getAttendance(
        selectedDate.format('YYYY-MM-DD'),
        selectedBatch
      );
      setAttendance(data);
    } catch (error) {
      showSnackbar('Failed to fetch attendance', 'error');
    }
  };

  const handleMarkAttendance = async (studentId, status) => {
    try {
      const records = [{
        studentId,
        status,
        batch: selectedBatch
      }];

      await api.markAttendance(selectedDate.format('YYYY-MM-DD'), records);
      showSnackbar('Attendance marked successfully', 'success');
      fetchAttendance();
    } catch (error) {
      showSnackbar('Failed to mark attendance', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getBatches = () => {
    const batches = [...new Set(students.map(student => student.batch))];
    return batches.sort();
  };

  const getStudentsByBatch = () => {
    return students.filter(student => student.batch === selectedBatch);
  };

  const getAttendanceStatus = (studentId) => {
    const record = attendance.find(a => a.studentId === studentId);
    return record ? record.status : 'absent';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Attendance Management
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Batch</InputLabel>
          <Select
            value={selectedBatch}
            label="Batch"
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            {getBatches().map((batch) => (
              <MenuItem key={batch} value={batch}>
                {batch}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
      </Box>

      {selectedBatch && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Batch</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getStudentsByBatch().map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.batch}</TableCell>
                  <TableCell align="center">
                    {getAttendanceStatus(student.id)}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleMarkAttendance(student.id, 'present')}
                      sx={{ mr: 1 }}
                    >
                      Present
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleMarkAttendance(student.id, 'absent')}
                    >
                      Absent
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Attendance; 