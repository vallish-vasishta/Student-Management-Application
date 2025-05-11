const { Attendance } = require('../models');
const dayjs = require('dayjs');
const { v4: uuidv4 } = require('uuid');

async function seedAttendance() {
  try {
    const batches = ['1-mar', '2-mar', '2-apr', '4-apr'];
    const statuses = ['present', 'absent', 'late'];
    const remarks = [
      'Called in sick',
      'Traffic delay',
      'Family emergency',
      'On time',
      null
    ];

    const attendanceRecords = [];
    const today = dayjs();

    // Generate attendance records for the last 30 days for each batch
    for (const batch of batches) {
      for (let i = 0; i < 30; i++) {
        // Skip some days randomly to make the data more realistic
        if (Math.random() < 0.3) continue;

        attendanceRecords.push({
          id: uuidv4(), // Generate a proper UUID
          studentId: batch,
          date: today.subtract(i, 'day').format('YYYY-MM-DD'),
          status: statuses[Math.floor(Math.random() * statuses.length)],
          remarks: remarks[Math.floor(Math.random() * remarks.length)],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // Bulk create the attendance records
    await Attendance.bulkCreate(attendanceRecords);
    console.log('Attendance seeding completed.');
  } catch (error) {
    console.error('Error seeding attendance:', error);
  }
}

seedAttendance(); 