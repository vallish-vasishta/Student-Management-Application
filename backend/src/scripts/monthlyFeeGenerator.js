const cron = require('node-cron');
const { format } = require('date-fns');
const { Fee, Student } = require('../models');

// Run on the 1st day of every month at 9:00 AM
const monthlyFeeGenerator = () => {
  cron.schedule('0 9 1 * *', async () => {
    try {
      console.log('Starting monthly fee generation...');
      
      const currentDate = new Date();
      const feesMonth = format(currentDate, 'yyyy-MM-dd');
      
      // Get all active students
      const students = await Student.findAll();
      
      if (students.length === 0) {
        console.log('No students found for fee generation');
        return;
      }

      const createdFees = [];
      const skippedStudents = [];

      // Create fee records for each student
      for (const student of students) {
        // Check if fee record already exists for this student and month
        const existingFee = await Fee.findOne({
          where: {
            studentId: student.id,
            feesMonth
          }
        });

        if (existingFee) {
          skippedStudents.push({
            studentId: student.id,
            studentName: student.name,
            reason: 'Fee record already exists'
          });
          continue;
        }

        // Create new fee record
        const fee = await Fee.create({
          studentId: student.id,
          feesMonth,
          amount: 0, // Default amount
          status: 'Unpaid',
          paymentDate: null,
          paymentMode: null
        });

        createdFees.push(fee);
      }

      console.log(`Monthly fee generation completed:`, {
        createdCount: createdFees.length,
        skippedCount: skippedStudents.length,
        totalStudents: students.length,
        month: feesMonth
      });

      // You could also send notifications here (email, SMS, etc.)
      
    } catch (error) {
      console.error('Error in monthly fee generation:', error);
    }
  });
};

module.exports = monthlyFeeGenerator;
