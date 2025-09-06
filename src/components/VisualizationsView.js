import React, { useMemo, useCallback } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  PaidOutlined,
  GroupOutlined,
  WarningAmberOutlined,
  TrendingUpOutlined,
} from '@mui/icons-material';
import { format, isPast, parseISO } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const StatCard = ({ title, value, icon, color, theme }) => (
  <Card sx={{ 
    height: '100%',
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
      boxShadow: theme.palette.mode === 'dark' 
        ? '0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)'
        : '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
      transition: 'box-shadow 0.2s ease-in-out',
    },
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
          backgroundColor: `${color}15`,
          borderRadius: '50%',
          p: 1.5,
          mr: 2,
          '& svg': {
            color: color,
            fontSize: 24,
          }
        }}>
          {icon}
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const VisualizationsView = React.memo(({ 
  filteredStudents, 
  students, 
  batchSummary, 
  selectedTimeRange 
}) => {
  const theme = useTheme();
  // Get unique months from the last 3 months
  const availableMonths = useMemo(() => {
    const months = new Set();
    const today = new Date();
    
    // Add last 3 months
    for (let i = 0; i < 3; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.add(format(date, 'yyyy-MM'));
    }
    
    return Array.from(months).sort().reverse();
  }, []);

  // Group students by month for the summary
  const monthlyStats = useMemo(() => {
    const stats = {};
    availableMonths.forEach(month => {
      // Since students don't have feesMonth anymore, we'll use current month for all students
      const monthStudents = students.filter(student => {
        // For now, include all students in current month since fees are separate
        return true;
      });
      
      const totalAmount = monthStudents.reduce((sum, s) => sum + Number(s.amount || 0), 0);
      const collectedAmount = monthStudents
        .filter(s => s.status === 'Paid')
        .reduce((sum, s) => sum + Number(s.amount || 0), 0);
      
      stats[month] = {
        total: monthStudents.length,
        paid: monthStudents.filter(s => s.status === 'Paid').length,
        unpaid: monthStudents.filter(s => s.status === 'Unpaid').length,
        amount: totalAmount,
        collectedAmount: collectedAmount,
        pendingAmount: totalAmount - collectedAmount
      };
    });
    return stats;
  }, [students, availableMonths]);

  const currentMetrics = useMemo(() => ({
    totalStudents: filteredStudents.length,
    totalFees: filteredStudents.reduce((sum, student) => sum + Number(student.amount || 0), 0),
    overdueCount: filteredStudents.filter(student => {
      // Check if student has unpaid status and if we can determine if it's overdue
      if (student.status === 'Unpaid' && student.feesMonth) {
        try {
          return isPast(parseISO(student.feesMonth));
        } catch (error) {
          return false;
        }
      }
      return false;
    }).length,
    collectionRate: filteredStudents.length > 0 
      ? (filteredStudents.filter(s => s.status === 'Paid').length / filteredStudents.length) * 100 
      : 0
  }), [filteredStudents]);

  const getMonthlyTrends = useCallback(() => {
    const monthlyData = {};
    
    // Since students don't have feesMonth, we'll create a simple trend based on current data
    const currentMonth = format(new Date(), 'MMMM yyyy');
    
    // Group by current month for now
    students.forEach(student => {
      if (!monthlyData[currentMonth]) {
        monthlyData[currentMonth] = {
          month: currentMonth,
          totalFees: 0,
          collectedFees: 0,
          pendingFees: 0,
          totalStudents: 0,
          paidStudents: 0
        };
      }
      
      const studentAmount = Number(student.amount || 0);
      monthlyData[currentMonth].totalFees += studentAmount;
      monthlyData[currentMonth].totalStudents += 1;
      
      if (student.status === 'Paid') {
        monthlyData[currentMonth].collectedFees += studentAmount;
        monthlyData[currentMonth].paidStudents += 1;
      } else {
        monthlyData[currentMonth].pendingFees += studentAmount;
      }
    });

    // Convert to array and sort by date
    return Object.values(monthlyData)
      .sort((a, b) => new Date(a.month) - new Date(b.month))
      .slice(-parseInt(selectedTimeRange));
  }, [students, selectedTimeRange]);

  const monthlyTrends = useMemo(() => getMonthlyTrends(), [getMonthlyTrends]);

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={currentMetrics.totalStudents}
            icon={<GroupOutlined sx={{ color: '#1976d2' }} />}
            color="#1976d2"
            theme={theme}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Fees"
            value={formatCurrency(currentMetrics.totalFees)}
            icon={<PaidOutlined sx={{ color: '#2e7d32' }} />}
            color="#2e7d32"
            theme={theme}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Overdue"
            value={currentMetrics.overdueCount}
            icon={<WarningAmberOutlined sx={{ color: '#d32f2f' }} />}
            color="#d32f2f"
            theme={theme}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Collection Rate"
            value={`${Math.round(currentMetrics.collectionRate)}%`}
            icon={<TrendingUpOutlined sx={{ color: '#7b1fa2' }} />}
            color="#7b1fa2"
            theme={theme}
          />
        </Grid>
      </Grid>

      {/* Monthly Analytics Cards */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Monthly Analytics
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {availableMonths.map(month => {
          const stats = monthlyStats[month];
          const collectionRate = stats.total ? (stats.paid / stats.total) * 100 : 0;
          
          return (
            <Grid item xs={12} md={4} key={month}>
              <Card sx={{ 
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {format(parseISO(`${month}-01`), 'MMMM yyyy')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Students: {stats.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Paid: {stats.paid}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Unpaid: {stats.unpaid}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Amount: {formatCurrency(stats.amount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Collected: {formatCurrency(stats.collectedAmount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending: {formatCurrency(stats.pendingAmount)}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={collectionRate}
                      sx={{ height: 8, borderRadius: 5 }}
                    />
                    <Typography variant="body2" color="text.secondary" align="right" sx={{ mt: 1 }}>
                      Collection Rate: {Math.round(collectionRate)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            mb: 3,
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Monthly Collection Trends</Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(value) => format(new Date(value), 'MMM yy')}
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `₹${value / 1000}K`}
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <RechartsTooltip
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(label) => format(new Date(label), 'MMMM yyyy')}
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                        color: theme.palette.text.primary,
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="collectedFees"
                      stackId="1"
                      stroke="#4caf50"
                      fill="#4caf50"
                      name="Collected"
                    />
                    <Area
                      type="monotone"
                      dataKey="pendingFees"
                      stackId="1"
                      stroke="#ff9800"
                      fill="#ff9800"
                      name="Pending"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            mb: 3,
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Collection Rate by Batch</Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={batchSummary}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: theme.palette.text.secondary }} />
                    <YAxis dataKey="batch" type="category" width={100} tick={{ fill: theme.palette.text.secondary }} />
                    <RechartsTooltip
                      formatter={(value) => `${Math.round(value)}%`}
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                        color: theme.palette.text.primary,
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="collectionRate"
                      fill="#2196f3"
                      name="Collection Rate"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
});

export default VisualizationsView; 