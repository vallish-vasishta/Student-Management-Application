import React, { useState, useMemo, useCallback } from 'react';
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
  Box,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  FileDownload as FileDownloadIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import api from '../services/api';

const DetailedView = React.memo(({ 
  students = [], 
  onEdit, 
  onMarkAsPaid, 
  allBatches = [], 
  feesData = [], 
  fetchFees, 
  setSnackbar 
}) => {
  // Add a function to get batch name from student object
  const getBatchName = useCallback((student) => {
    if (!student) return 'N/A';
    return student.batch?.name || 'N/A';
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
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

  // Generate all months for the past year
  const availableMonths = useMemo(() => {
    const months = [];
    const currentDate = new Date();
    
    // Generate 12 months from current month backwards
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = format(date, 'yyyy-MM');
      months.push(monthStr);
    }
    
    return months;
  }, []);

  // Get all batches from database (same logic as StudentsView)
  const availableBatches = useMemo(() => {
    const batchNames = allBatches.map(batch => batch.name || batch).filter(Boolean);
    return ['all', ...batchNames.sort()];
  }, [allBatches]);

  // Filter and sort students/fees
  const filteredData = useMemo(() => {
    let result = [];

    // Show only students who have fee records in the database for the selected month
    result = feesData
      .filter(fee => {
        // Convert database date to YYYY-MM format for comparison
        const feeMonth = fee.feesMonth ? fee.feesMonth.substring(0, 7) : null;
        return feeMonth === selectedMonth;
      })
      .map(fee => {
        // Find the corresponding student
        const student = students.find(s => s.id === fee.studentId);
        if (!student) {
          return null; // Skip if student not found
        }
        
        return {
          student,
          fee: fee
        };
      })
      .filter(item => item !== null); // Remove null items

    // Filter by batch if selected
    if (selectedBatch !== 'all') {
      result = result.filter(item => 
        getBatchName(item.student) === selectedBatch
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.student.name?.toLowerCase().includes(query) ||
        getBatchName(item.student)?.toLowerCase().includes(query)
      );
    }

    // Sort: unpaid students first, then by selected field
    result.sort((a, b) => {
      // First sort by payment status (unpaid first)
      if (a.fee.status === 'Unpaid' && b.fee.status !== 'Unpaid') return -1;
      if (a.fee.status !== 'Unpaid' && b.fee.status === 'Unpaid') return 1;
      
      // Then sort by selected field
      let aValue, bValue;
      switch (sortField) {
        case 'name':
          aValue = a.student.name || '';
          bValue = b.student.name || '';
          break;
        case 'batch':
          aValue = getBatchName(a.student) || '';
          bValue = getBatchName(b.student) || '';
          break;
        case 'amount':
          aValue = Number(a.fee.amount) || 0;
          bValue = Number(b.fee.amount) || 0;
          break;
        case 'status':
          aValue = a.fee.status || '';
          bValue = b.fee.status || '';
          break;
        case 'feesMonth':
          aValue = a.fee.feesMonth || '';
          bValue = b.fee.feesMonth || '';
          break;
        default:
          aValue = a.student[sortField] || '';
          bValue = b.student[sortField] || '';
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [students, feesData, searchQuery, selectedBatch, selectedMonth, sortField, sortDirection, getBatchName]);

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
      const data = filteredData.map(item => ({
        'Student Name': item.student.name || '',
        'Batch': getBatchName(item.student) || '',
        'Fees Month': item.fee.feesMonth || '',
        'Amount': item.fee.amount || 0,
        'Status': item.fee.status || '',
        'Payment Date': item.fee.paymentDate || '',
        'Payment Mode': item.fee.paymentMode || ''
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
    // We'll try to update first, and if that fails, we'll create a new record
    
    try {
      if (!selectedFee) {
        console.error('No fee selected for editing');
        return;
      }

      // Convert month format to full date format for database
      const feeMonthDate = feeData.feesMonth.includes('-01') ? feeData.feesMonth : `${feeData.feesMonth}-01`;
      
      const updatedFeeData = {
        feesMonth: feeMonthDate,
        amount: Number(feeData.amount),
        status: feeData.status,
        paymentDate: feeData.status === 'Paid' ? feeData.paymentDate : null,
        paymentMode: feeData.status === 'Paid' ? feeData.paymentMode : null
      };
      
      // Update the fee record in the database
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
      
      // Show success message
      if (setSnackbar) {
        setSnackbar({
          open: true,
          message: 'Fee record updated successfully',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error editing fee:', error);
      
      // Show error message
      if (setSnackbar) {
        setSnackbar({
          open: true,
          message: `Failed to update fee record: ${error.response?.data?.error || error.message}`,
          severity: 'error'
        });
      }
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
    // Convert database date format (YYYY-MM-DD) to month format (YYYY-MM) for editing
    const formattedMonth = fee.feesMonth ? fee.feesMonth.substring(0, 7) : format(new Date(), 'yyyy-MM');
    
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

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
        <Grid item xs={12} md={2}>
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
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Filter by Batch</InputLabel>
            <Select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              label="Filter by Batch"
            >
              {availableBatches.map((batch) => (
                <MenuItem key={batch} value={batch}>
                  {batch === 'all' ? 'All Batches' : batch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Select Month</InputLabel>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              label="Select Month"
            >
              {availableMonths.map((month) => (
                <MenuItem key={month} value={month}>
                  {format(parseISO(month), 'MMMM yyyy')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            display: 'flex', 
            gap: 1.5, 
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'flex-end',
            height: '100%',
            minHeight: '56px'
          }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddDialog(true)}
              sx={{ 
                minWidth: '120px',
                height: '40px',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Add Fee
            </Button>

            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExport('excel')}
              sx={{ 
                minWidth: '140px',
                height: '40px',
                textTransform: 'none',
                borderRadius: '8px',
                borderWidth: '1.5px'
              }}
            >
              Export Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExport('pdf')}
              sx={{ 
                minWidth: '140px',
                height: '40px',
                textTransform: 'none',
                borderRadius: '8px',
                borderWidth: '1.5px'
              }}
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
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {selectedBatch !== 'all' ? `No students found in batch "${selectedBatch}"` : `No students found for ${format(parseISO(selectedMonth), 'MMMM yyyy')}`}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow key={`${item.student.id}-${item.fee.feesMonth}`}>
                  <TableCell>{item.student.name || ''}</TableCell>
                  <TableCell>{getBatchName(item.student)}</TableCell>

                  <TableCell>₹{item.fee.amount || 0}</TableCell>
                <TableCell>
                  <Chip 
                      label={item.fee.status || 'Unpaid'}
                      color={item.fee.status === 'Paid' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                  <TableCell>{item.fee.paymentDate || '-'}</TableCell>
                  <TableCell>{item.fee.paymentMode || '-'}</TableCell>
                  <TableCell>
                      <IconButton 
                        size="small" 
                      onClick={() => handleEditClick(item.fee)}
                      sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    {item.fee.status !== 'Paid' && (
                        <IconButton 
                          size="small"
                        onClick={() => handleMarkAsPaid(item.fee)}
                          color="success"
                        sx={{ mr: 1 }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedFee(item.fee);
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

export default DetailedView; 