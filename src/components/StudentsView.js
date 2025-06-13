import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Snackbar, Alert, MenuItem, Select, FormControl, InputLabel, Typography
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';

const StudentsView = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStudent, setCurrentStudent] = useState({ name: '', batchId: '', contact: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteId, setDeleteId] = useState(null);

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
        // Generate a unique id for new student
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        await api.addStudent({ ...currentStudent, id });
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
      await api.deleteStudent(deleteId);
      setSnackbar({ open: true, message: 'Student deleted', severity: 'success' });
      setStudents((prev) => prev.filter(s => s.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete student', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Students</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Student
        </Button>
      </Box>
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
            {students.map(student => (
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
            {students.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={4} align="center">No students found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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