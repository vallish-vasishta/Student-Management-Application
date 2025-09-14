import { useEffect } from 'react';
import { format, startOfMonth } from 'date-fns';
import api from '../services/api';

// Hook for automatic monthly fee generation
export const useAutoMonthlyFeeGeneration = (fetchFees, setSnackbar) => {
  useEffect(() => {
    const checkAndGenerateMonthlyFees = async () => {
      try {
        const currentMonth = format(new Date(), 'yyyy-MM');
        const lastGenerationMonth = localStorage.getItem('lastFeeGenerationMonth');
        
        // Only generate if we haven't generated fees for this month yet
        if (lastGenerationMonth !== currentMonth) {
          console.log('Auto-generating fees for new month:', currentMonth);
          
          const monthDate = new Date(currentMonth + '-01');
          const feesMonth = format(monthDate, 'yyyy-MM-dd');
          
          const result = await api.generateMonthlyFees(feesMonth, 0);
          
          // Store the current month as the last generation month
          localStorage.setItem('lastFeeGenerationMonth', currentMonth);
          
          // Refresh fees data
          await fetchFees();
          
          // Show notification
          setSnackbar({
            open: true,
            message: `Auto-generated ${result.createdCount} fee records for ${format(monthDate, 'MMMM yyyy')}`,
            severity: 'info'
          });
        }
      } catch (error) {
        console.error('Error in auto monthly fee generation:', error);
      }
    };

    // Check on app load
    checkAndGenerateMonthlyFees();
    
    // Check daily (in case app is left open for days)
    const dailyCheck = setInterval(checkAndGenerateMonthlyFees, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(dailyCheck);
  }, [fetchFees, setSnackbar]);
};

export default useAutoMonthlyFeeGeneration;
