import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import FeesDashboard from './components/FeesDashboard';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme();

// Create a wrapper component to handle query parameters
const DashboardWrapper = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('tab');
  
  return <FeesDashboard initialTab={tab} />;
};

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // If user is a trainer and not already on the attendance tab, redirect
  if (userRole === 'trainer' && !location.search.includes('tab=attendance')) {
    return <Navigate to="/dashboard?tab=attendance" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardWrapper />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 