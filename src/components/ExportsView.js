import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  useTheme,
  Paper,
  Divider
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  TableChart as TableChartIcon,
  PictureAsPdfOutlined,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const ExportsView = ({ 
  students = [], 
  feesData = [], 
  allBatches = [],
  getBatchName 
}) => {
  const theme = useTheme();
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [exportType, setExportType] = useState('fees');

  // Generate all months for the past year
  const availableMonths = useMemo(() => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy')
      });
    }
    return months;
  }, []);

  // Filter data based on selected batch and month
  const filteredData = useMemo(() => {
    if (exportType === 'fees') {
      // Process fees data similar to FeeDashboard component
      const processedFees = feesData
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
        return processedFees.filter(item => 
          getBatchName(item.student) === selectedBatch
        );
      }
      
      return processedFees;
    } else {
      // For students export
      return students.filter(student => {
        const batchMatch = selectedBatch === 'all' || getBatchName(student) === selectedBatch;
        return batchMatch;
      });
    }
  }, [feesData, students, selectedBatch, selectedMonth, exportType, getBatchName]);

  const handleExport = async (format) => {
    try {
      let data, filename, headers;

      if (exportType === 'fees') {
        data = filteredData.map(item => ({
          'Student Name': item.student.name || '',
          'Batch': getBatchName(item.student) || '',
          'Fees Month': item.fee.feesMonth || '',
          'Amount': item.fee.amount || 0,
          'Status': item.fee.status || ''
        }));
        filename = 'fees_data';
        headers = ['Student Name', 'Batch', 'Fees Month', 'Amount', 'Status'];
      } else {
        data = filteredData.map(student => ({
          'Student Name': student.name || '',
          'Batch': getBatchName(student) || '',
          'Contact': student.contact || '',
          'Email': student.email || '',
          'Created Date': student.createdAt ? format(parseISO(student.createdAt), 'yyyy-MM-dd') : ''
        }));
        filename = 'students_data';
        headers = ['Student Name', 'Batch', 'Contact', 'Email', 'Created Date'];
      }

      if (format === 'excel') {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `${exportType.charAt(0).toUpperCase() + exportType.slice(1)} Data`);
        XLSX.writeFile(wb, `${filename}.xlsx`);
      } else if (format === 'pdf') {
        const doc = new jsPDF();
        doc.autoTable({
          head: [headers],
          body: data.map(row => Object.values(row))
        });
        doc.save(`${filename}.pdf`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Data Exports
      </Typography>
      
      <Grid container spacing={3}>
        {/* Export Settings */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Export Settings
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Export Type</InputLabel>
                <Select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                  label="Export Type"
                >
                  <MenuItem value="fees">Fees Data</MenuItem>
                  <MenuItem value="students">Students Data</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Batch</InputLabel>
                <Select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  label="Batch"
                >
                  <MenuItem value="all">All Batches</MenuItem>
                  {allBatches.map((batch) => (
                    <MenuItem key={batch.id || batch} value={batch.name || batch}>
                      {batch.name || batch}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {exportType === 'fees' && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    label="Month"
                  >
                    {availableMonths.map((month) => (
                      <MenuItem key={month.value} value={month.value}>
                        {month.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="text.secondary">
                {filteredData.length} records will be exported
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Export Options */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.palette.mode === 'dark' ? 4 : 8
                  }
                }}
                onClick={() => handleExport('excel')}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <TableChartIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: 'success.main', 
                      mb: 2 
                    }} 
                  />
                  <Typography variant="h6" gutterBottom>
                    Export to Excel
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Download data as Excel spreadsheet (.xlsx)
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<FileDownloadIcon />}
                    color="success"
                    fullWidth
                  >
                    Download Excel
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.palette.mode === 'dark' ? 4 : 8
                  }
                }}
                onClick={() => handleExport('pdf')}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <PictureAsPdfOutlined 
                    sx={{ 
                      fontSize: 48, 
                      color: 'error.main', 
                      mb: 2 
                    }} 
                  />
                  <Typography variant="h6" gutterBottom>
                    Export to PDF
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Download data as PDF document (.pdf)
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<FileDownloadIcon />}
                    color="error"
                    fullWidth
                  >
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Data Preview */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Preview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Showing {filteredData.length} records for {exportType === 'fees' ? 'fees' : 'students'} data
              </Typography>
              
              {filteredData.length > 0 ? (
                <Paper sx={{ maxHeight: 300, overflow: 'auto' }}>
                  <Box sx={{ p: 2 }}>
                    {exportType === 'fees' ? (
                      <Grid container spacing={1}>
                        {filteredData.slice(0, 5).map((item, index) => (
                          <Grid item xs={12} key={index}>
                            <Box sx={{ 
                              p: 1, 
                              border: '1px solid', 
                              borderColor: 'divider', 
                              borderRadius: 1,
                              mb: 1
                            }}>
                              <Typography variant="body2">
                                <strong>{item.student?.name || 'Unknown'}</strong> - {getBatchName(item.student)} - 
                                ₹{item.fee?.amount || 0} - {item.fee?.status || 'Unknown'}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                        {filteredData.length > 5 && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                              ... and {filteredData.length - 5} more records
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    ) : (
                      <Grid container spacing={1}>
                        {filteredData.slice(0, 5).map((student, index) => (
                          <Grid item xs={12} key={index}>
                            <Box sx={{ 
                              p: 1, 
                              border: '1px solid', 
                              borderColor: 'divider', 
                              borderRadius: 1,
                              mb: 1
                            }}>
                              <Typography variant="body2">
                                <strong>{student.name}</strong> - {getBatchName(student)} - 
                                {student.contact || 'No contact'}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                        {filteredData.length > 5 && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                              ... and {filteredData.length - 5} more records
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    )}
                  </Box>
                </Paper>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No data available for the selected filters
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExportsView;
