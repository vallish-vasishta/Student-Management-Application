const express = require('express');
const router = express.Router();
const { Attendance, Student } = require('../models');
const { Op } = require('sequelize');

// Get attendance records for a specific date and batch
router.get('/', async (req, res) => {
  const { date, batch } = req.query;
  console.log('Fetching attendance for:', { date, batch });
  
  try {
    const records = await Attendance.findAll({
      include: [{
        model: Student,
        attributes: ['name']
      }],
      where: {
        date,
        batch
      }
    });
    console.log('Attendance records found:', records.length);
    res.json(records);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark attendance for students
router.post('/', async (req, res) => {
  const { date, records } = req.body;
  console.log('Received attendance data:', { date, records });
  
  if (!date || !records || !Array.isArray(records)) {
    console.error('Invalid request data:', { date, records });
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    for (const record of records) {
      const { studentId, status, batch } = record;
      console.log('Processing record:', { studentId, status, batch });
      
      if (!studentId || !status || !batch) {
        throw new Error(`Invalid record data: ${JSON.stringify(record)}`);
      }

      // Upsert attendance record
      const [attendance, created] = await Attendance.upsert({
        studentId,
        date,
        status,
        batch
      }, {
        returning: true
      });
      
      console.log('Record saved:', attendance.toJSON());
    }

    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

module.exports = router; 