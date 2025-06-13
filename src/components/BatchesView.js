import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Snackbar, Alert, Typography
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';

const BatchesView = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBatch, setCurrentBatch] = useState({ name: '', timings: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const fetchBatches = async () => {
      setLoading(true);
      try {
        const res = await api.getBatches();
        setBatches(res);
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to fetch batches', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  const handleOpenDialog = (batch = null) => {
    setEditMode(!!batch);
    setCurrentBatch(batch ? { ...batch } : { name: '', timings: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentBatch({ name: '', timings: '' });
  };

  const handleChange = (e) => {
    setCurrentBatch(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      if (!currentBatch.name) {
        setSnackbar({ open: true, message: 'Batch name is required', severity: 'error' });
        return;
      }
      if (editMode) {
        await api.updateBatch(currentBatch.id, currentBatch);
        setSnackbar({ open: true, message: 'Batch updated', severity: 'success' });
      } else {
        await api.addBatch(currentBatch);
        setSnackbar({ open: true, message: 'Batch added', severity: 'success' });
      }
      // Refresh list
      const res = await api.getBatches();
      setBatches(res);
      handleCloseDialog();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save batch', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteBatch(deleteId);
      setSnackbar({ open: true, message: 'Batch deleted', severity: 'success' });
      setBatches((prev) => prev.filter(b => b.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete batch', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Batches</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Batch
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Timings</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {batches.map(batch => (
              <TableRow key={batch.id}>
                <TableCell>{batch.name}</TableCell>
                <TableCell>{batch.timings}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleOpenDialog(batch)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => setDeleteId(batch.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {batches.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={3} align="center">No batches found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editMode ? 'Edit Batch' : 'Add Batch'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Name"
            name="name"
            value={currentBatch.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            margin="normal"
            label="Timings"
            name="timings"
            value={currentBatch.timings}
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
        <DialogTitle>Delete Batch</DialogTitle>
        <DialogContent>Are you sure you want to delete this batch?</DialogContent>
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

export default BatchesView; 