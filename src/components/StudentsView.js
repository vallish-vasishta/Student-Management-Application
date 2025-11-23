import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Snackbar, Alert, MenuItem, Select, FormControl, InputLabel, Typography, InputAdornment, Grid
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import api from '../services/api';

const StudentsView = ({ onAddStudent }) => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStudent, setCurrentStudent] = useState({ name: '', batchId: '', contact: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteId, setDeleteId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch students and batches
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [studentsRes, batchesRes] = await Promise.all([
          api.getStudents(),
          api.getBatches()
        ]);
        setStudents(studentsRes);
        setBatches(batchesRes);
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to fetch data', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenDialog = (student = null) => {
    setEditMode(!!student);
    setCurrentStudent(student ? { ...student } : { name: '', batchId: '', contact: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentStudent({ name: '', batchId: '', contact: '' });
  };

  const handleChange = (e) => {
    setCurrentStudent(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      if (!currentStudent.name || !currentStudent.batchId) {
        setSnackbar({ open: true, message: 'Name and Batch are required', severity: 'error' });
        return;
      }
      if (editMode) {
        await api.updateStudent(currentStudent.id, currentStudent);
        setSnackbar({ open: true, message: 'Student updated', severity: 'success' });
      } else {
        // Use the handleAddStudent function from parent component to create fee records
        if (onAddStudent) {
          await onAddStudent(currentStudent);
        } else {
          // Fallback to direct API call if onAddStudent is not provided
          await api.addStudent(currentStudent);
        }
        setSnackbar({ open: true, message: 'Student added', severity: 'success' });
      }
      // Refresh list
      const studentsRes = await api.getStudents();
      setStudents(studentsRes);
      handleCloseDialog();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save student', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      // First, delete all associated fee records for this student
      try {
        const studentFees = await api.getStudentFees(deleteId);
        if (studentFees && studentFees.length > 0) {
          // Delete each fee record
          for (const fee of studentFees) {
            try {
              await api.deleteFee(deleteId, fee.feesMonth);
            } catch (feeError) {
              console.error('Error deleting fee record:', feeError);
              // Continue with other fees even if one fails
            }
          }
        }
      } catch (feeError) {
        console.error('Error fetching/deleting student fees:', feeError);
        // Continue with student deletion attempt
      }

      // Now delete the student
      await api.deleteStudent(deleteId);
      setSnackbar({ open: true, message: 'Student deleted successfully', severity: 'success' });
      setStudents((prev) => prev.filter(s => s.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting student:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete student';
      setSnackbar({ 
        open: true, 
        message: errorMessage.includes('foreign key') 
          ? 'Cannot delete student. Please delete all associated fee records first, or contact administrator.'
          : `Failed to delete student: ${errorMessage}`,
        severity: 'error' 
      });
    }
  };

  // Filter and limit displayed data
  const filteredData = useMemo(() => {
    let result = students;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(student => {
        const studentName = student.name?.toLowerCase() || '';
        const batchName = batches.find(b => b.id === student.batchId)?.name?.toLowerCase() || '';
        const contact = student.contact?.toLowerCase() || '';
        return studentName.includes(query) || batchName.includes(query) || contact.includes(query);
      });
    }

    return result;
  }, [students, searchQuery, batches]);

  // Limit displayed data to top 10 by default
  const displayedData = useMemo(() => {
    if (showAll) {
      return filteredData;
    }
    return filteredData.slice(0, 10);
  }, [filteredData, showAll]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Students</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Student
        </Button>
      </Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, batch, or contact"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    edge="end"
                    sx={{ mr: -1 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Batch</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedData.map(student => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{batches.find(b => b.id === student.batchId)?.name || ''}</TableCell>
                <TableCell>{student.contact}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleOpenDialog(student)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => setDeleteId(student.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {displayedData.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {searchQuery ? `No students found matching "${searchQuery}"` : 'No students found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Expand/Collapse Button */}
      {filteredData.length > 10 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => setShowAll(!showAll)}
            endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {showAll 
              ? `Show Less (Top 10 of ${filteredData.length})` 
              : `Show All (${filteredData.length} total records)`}
          </Button>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editMode ? 'Edit Student' : 'Add Student'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Name"
            name="name"
            value={currentStudent.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Batch</InputLabel>
            <Select
              name="batchId"
              value={currentStudent.batchId}
              label="Batch"
              onChange={handleChange}
            >
              {batches.map(batch => (
                <MenuItem key={batch.id} value={batch.id}>{batch.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            label="Contact"
            name="contact"
            value={currentStudent.contact}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editMode ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Student</DialogTitle>
        <DialogContent>Are you sure you want to delete this student?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentsView; 