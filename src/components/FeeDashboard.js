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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import api from '../services/api';

const FeeDashboard = React.memo(({ 
  students = [], 
  onEdit, 
  allBatches = [], 
  feesData = [], 
  fetchFees, 
  setSnackbar,
  onGenerateMonthlyFees
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
  const [showAll, setShowAll] = useState(false);
  
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);
  const [numberOfMonths, setNumberOfMonths] = useState(5);
  const [newFee, setNewFee] = useState({
    studentId: '',
    feesMonth: format(new Date(), 'yyyy-MM'),
    amount: '',
    status: 'Unpaid'
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
        
        console.log('Processing fee:', {
          feeStudentId: fee.studentId,
          feeStudentIdType: typeof fee.studentId,
          foundStudent: student,
          allStudentIds: students.map(s => ({ id: s.id, name: s.name }))
        });
        
        if (!student) {
          console.warn('Student not found for fee:', fee);
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

  // Limit displayed data to top 10 by default
  const displayedData = useMemo(() => {
    if (showAll) {
      return filteredData;
    }
    return filteredData.slice(0, 10);
  }, [filteredData, showAll]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };


  const handleAddFee = async (feeData) => {
    try {
      // Validate: Cannot mark fee as "Paid" if amount is 0
      if (feeData.status === 'Paid' && (Number(feeData.amount) === 0 || !feeData.amount)) {
        setSnackbar({
          open: true,
          message: 'Cannot mark fee as Paid when amount is 0.00',
          severity: 'error'
        });
        return;
      }

      await api.addFee(feeData);
      await fetchFees(); // Refresh fees data
      setOpenAddDialog(false);
      setNewFee({
        studentId: '',
        feesMonth: format(new Date(), 'yyyy-MM'),
        amount: '',
        status: 'Unpaid'
      });
    } catch (error) {
      console.error('Error adding fee:', error);
    }
  };

  const handleEditFee = async (feeData) => {
    console.log('handleEditFee called with:', feeData);
    console.log('selectedFee:', selectedFee);
    
    try {
      if (!selectedFee) {
        console.error('No fee selected for editing');
        return;
      }

      // Validate: Cannot mark fee as "Paid" if amount is 0
      if (feeData.status === 'Paid' && (Number(feeData.amount) === 0 || !feeData.amount)) {
        setSnackbar({
          open: true,
          message: 'Cannot mark fee as Paid when amount is 0.00',
          severity: 'error'
        });
        return;
      }

      // Use the original feesMonth from the database to ensure exact match
      // Only update the amount and status, keep the original feesMonth
      const updatedFeeData = {
        feesMonth: selectedFee.fee.feesMonth, // Use original feesMonth from database
        amount: Number(feeData.amount),
        status: feeData.status,
        paymentDate: feeData.status === 'Paid' ? feeData.paymentDate : null,
        paymentMode: feeData.status === 'Paid' ? feeData.paymentMode : null
      };
      
      console.log('Original fee data from database:', selectedFee.fee);
      console.log('Using original feesMonth for update:', selectedFee.fee.feesMonth);
      console.log('Student ID being used:', selectedFee.fee.studentId);
      
      console.log('Updating fee with data:', {
        studentId: selectedFee.fee.studentId,
        updatedFeeData
      });
      
      // Update the fee record in the database
      await api.updateFees(selectedFee.fee.studentId, updatedFeeData);
      
      // Refresh the fees data
      await fetchFees();
      
      // Close the dialog and reset states
      setOpenEditDialog(false);
      setSelectedFee(null);
      setNewFee({
        studentId: '',
        feesMonth: format(new Date(), 'yyyy-MM'),
        amount: '',
        status: 'Unpaid'
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
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        studentId: selectedFee?.fee?.studentId,
        feeData: feeData
      });
      
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
      await api.deleteFee(selectedFee.fee.studentId, selectedFee.fee.feesMonth);
      await fetchFees(); // Refresh fees data
      setOpenDeleteDialog(false);
      setSelectedFee(null);
    } catch (error) {
      console.error('Error deleting fee:', error);
    }
  };


  const handleEditClick = (item) => {
    setSelectedFee(item);
    // Convert database date format (YYYY-MM-DD) to month format (YYYY-MM) for editing
    const formattedMonth = item.fee.feesMonth ? item.fee.feesMonth.substring(0, 7) : format(new Date(), 'yyyy-MM');
    
    console.log('Edit click - Complete item structure:', item);
    console.log('Edit click - Fee data:', item.fee);
    console.log('Edit click - Student data:', item.student);
    console.log('Edit click - Original fee data:', {
      originalFeesMonth: item.fee.feesMonth,
      formattedMonth: formattedMonth,
      studentId: item.fee.studentId,
      amount: item.fee.amount,
      status: item.fee.status
    });
    
    setNewFee({
      studentId: item.fee.studentId,
      feesMonth: formattedMonth,
      amount: item.fee.amount,
      status: item.fee.status
    });
    setOpenEditDialog(true);
  };

  const handleStudentNameClick = (item) => {
    setSelectedStudentForHistory(item.student);
    setNumberOfMonths(5); // Reset to default when opening dialog
    setOpenHistoryDialog(true);
  };

  // Get fee history for selected student (configurable number of months)
  const studentFeeHistory = useMemo(() => {
    if (!selectedStudentForHistory || !feesData.length) return [];

    const currentDate = new Date();
    const monthsList = [];
    
    // Generate months based on selected number
    for (let i = 0; i < numberOfMonths; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = format(date, 'yyyy-MM');
      monthsList.push(monthStr);
    }

    // Get all fees for this student
    const studentFees = feesData.filter(fee => {
      if (fee.studentId !== selectedStudentForHistory.id) return false;
      const feeMonth = fee.feesMonth ? fee.feesMonth.substring(0, 7) : null;
      return feeMonth && monthsList.includes(feeMonth);
    });

    // Sort by month (newest first)
    studentFees.sort((a, b) => {
      const monthA = a.feesMonth ? a.feesMonth.substring(0, 7) : '';
      const monthB = b.feesMonth ? b.feesMonth.substring(0, 7) : '';
      return monthB.localeCompare(monthA);
    });

    // Create a map of existing fees by month
    const feesMap = new Map();
    studentFees.forEach(fee => {
      const month = fee.feesMonth ? fee.feesMonth.substring(0, 7) : '';
      if (month) {
        feesMap.set(month, fee);
      }
    });

    // Create result array with all selected months, showing "No record" for missing months
    const result = monthsList.map(month => {
      if (feesMap.has(month)) {
        return {
          month,
          fee: feesMap.get(month),
          hasRecord: true
        };
      }
      return {
        month,
        fee: null,
        hasRecord: false
      };
    });

    return result;
  }, [selectedStudentForHistory, feesData, numberOfMonths]);

  // Check if any fee record has payment date
  const hasPaymentDate = useMemo(() => {
    return studentFeeHistory.some(item => item.hasRecord && item.fee?.paymentDate);
  }, [studentFeeHistory]);

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
        <Grid item xs={12} md={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onGenerateMonthlyFees && onGenerateMonthlyFees(selectedMonth)}
            fullWidth
            sx={{ height: '56px' }}
          >
            Generate Monthly Fees
          </Button>
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {selectedBatch !== 'all' ? `No students found in batch "${selectedBatch}"` : `No students found for ${format(parseISO(selectedMonth), 'MMMM yyyy')}`}
                </TableCell>
              </TableRow>
            ) : (
              displayedData.map((item) => (
                <TableRow key={`${item.student.id}-${item.fee.feesMonth}`}>
                  <TableCell>
                    <Typography
                      component="span"
                      onClick={() => handleStudentNameClick(item)}
                      sx={{
                        cursor: 'pointer',
                        color: 'primary.main',
                        '&:hover': {
                          color: 'primary.dark',
                        }
                      }}
                    >
                      {item.student.name || ''}
                    </Typography>
                  </TableCell>
                  <TableCell>{getBatchName(item.student)}</TableCell>

                  <TableCell>₹{item.fee.amount || 0}</TableCell>
                <TableCell>
                  <Chip 
                      label={item.fee.status || 'Unpaid'}
                      color={item.fee.status === 'Paid' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                  <TableCell>
                      <IconButton 
                        size="small" 
                      onClick={() => handleEditClick(item)}
                      sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedFee(item);
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
                <FormControl fullWidth>
                  <InputLabel>Fees Month</InputLabel>
                  <Select
                    name="feesMonth"
                    value={newFee.feesMonth}
                    onChange={(e) => setNewFee(prev => ({ ...prev, feesMonth: e.target.value }))}
                    label="Fees Month"
                    required
                  >
                    {availableMonths.map((month) => (
                      <MenuItem key={month} value={month}>
                        {format(parseISO(month), 'MMMM yyyy')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={newFee.amount}
                  onChange={(e) => {
                    const newAmount = e.target.value;
                    setNewFee(prev => {
                      // If amount is set to 0 and status is "Paid", automatically change to "Unpaid"
                      const updatedFee = { ...prev, amount: newAmount };
                      if (Number(newAmount) === 0 && prev.status === 'Paid') {
                        updatedFee.status = 'Unpaid';
                      }
                      return updatedFee;
                    });
                  }}
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
                    onChange={(e) => {
                      // Prevent setting status as "Paid" if amount is 0
                      if (e.target.value === 'Paid' && (Number(newFee.amount) === 0 || !newFee.amount)) {
                        setSnackbar({
                          open: true,
                          message: 'Cannot mark fee as Paid when amount is 0.00',
                          severity: 'warning'
                        });
                        return;
                      }
                      setNewFee(prev => ({ ...prev, status: e.target.value }));
                    }}
                    label="Status"
                  >
                    <MenuItem value="Paid" disabled={Number(newFee.amount) === 0 || !newFee.amount}>
                      Paid {Number(newFee.amount) === 0 || !newFee.amount ? '(Amount must be > 0)' : ''}
                    </MenuItem>
                    <MenuItem value="Unpaid">Unpaid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
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
          console.log('Edit form submitted with data:', newFee);
          console.log('Selected fee:', selectedFee);
          console.log('About to call handleEditFee');
          handleEditFee(newFee);
          console.log('handleEditFee call completed');
        }}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Student: {selectedFee?.student?.name || 'N/A'}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Batch: {getBatchName(selectedFee?.student)}
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
                  onChange={(e) => {
                    const newAmount = e.target.value;
                    setNewFee(prev => {
                      // If amount is set to 0 and status is "Paid", automatically change to "Unpaid"
                      const updatedFee = { ...prev, amount: newAmount };
                      if (Number(newAmount) === 0 && prev.status === 'Paid') {
                        updatedFee.status = 'Unpaid';
                      }
                      return updatedFee;
                    });
                  }}
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
                    onChange={(e) => {
                      // Prevent setting status as "Paid" if amount is 0
                      if (e.target.value === 'Paid' && (Number(newFee.amount) === 0 || !newFee.amount)) {
                        setSnackbar({
                          open: true,
                          message: 'Cannot mark fee as Paid when amount is 0.00',
                          severity: 'warning'
                        });
                        return;
                      }
                      setNewFee(prev => ({ ...prev, status: e.target.value }));
                    }}
                    label="Status"
                  >
                    <MenuItem value="Paid" disabled={Number(newFee.amount) === 0 || !newFee.amount}>
                      Paid {Number(newFee.amount) === 0 || !newFee.amount ? '(Amount must be > 0)' : ''}
                    </MenuItem>
                    <MenuItem value="Unpaid">Unpaid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              onClick={() => console.log('Update Fee button clicked')}
            >
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
            Are you sure you want to delete the fee record for {selectedFee?.student?.name} for the month of {selectedFee?.fee?.feesMonth}?
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

      {/* Fee History Dialog */}
      <Dialog
        open={openHistoryDialog}
        onClose={() => {
          setOpenHistoryDialog(false);
          setSelectedStudentForHistory(null);
          setNumberOfMonths(5); // Reset to default when closing
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Fee History - {selectedStudentForHistory?.name || 'N/A'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Batch: {getBatchName(selectedStudentForHistory)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                  Number of Months
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={numberOfMonths}
                    onChange={(e) => setNumberOfMonths(Number(e.target.value))}
                    displayEmpty
                  >
                    {[1, 2, 3, 4, 5, 6, 9, 12, 18, 24].map(num => (
                      <MenuItem key={num} value={num}>
                        Last {num} {num === 1 ? 'Month' : 'Months'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Month</strong></TableCell>
                  <TableCell align="right"><strong>Amount</strong></TableCell>
                  <TableCell align="center"><strong>Status</strong></TableCell>
                  {hasPaymentDate && (
                    <TableCell><strong>Payment Date</strong></TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {studentFeeHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={hasPaymentDate ? 4 : 3} align="center">
                      No fee records found for the last {numberOfMonths} {numberOfMonths === 1 ? 'month' : 'months'}.
                    </TableCell>
                  </TableRow>
                ) : (
                  studentFeeHistory.map((item) => (
                    <TableRow key={item.month}>
                      <TableCell>
                        {format(parseISO(item.month + '-01'), 'MMMM yyyy')}
                      </TableCell>
                      <TableCell align="right">
                        {item.hasRecord ? (
                          <Typography>₹{item.fee.amount || 0}</Typography>
                        ) : (
                          <Typography color="text.secondary" fontStyle="italic">
                            No record
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {item.hasRecord ? (
                          <Chip
                            label={item.fee.status || 'Unpaid'}
                            color={item.fee.status === 'Paid' ? 'success' : 'error'}
                            size="small"
                          />
                        ) : (
                          <Typography color="text.secondary" fontStyle="italic" variant="body2">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      {hasPaymentDate && (
                        <TableCell>
                          {item.hasRecord && item.fee?.paymentDate ? (
                            format(parseISO(item.fee.paymentDate), 'dd MMM yyyy')
                          ) : (
                            <Typography color="text.secondary" fontStyle="italic" variant="body2">
                              -
                            </Typography>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenHistoryDialog(false);
            setSelectedStudentForHistory(null);
          }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default FeeDashboard; 