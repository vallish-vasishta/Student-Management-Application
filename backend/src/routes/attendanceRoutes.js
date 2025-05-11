const express = require('express');
const router = express.Router();
const { Attendance, Student } = require('../models');
const { Op } = require('sequelize');

// Get attendance for a specific date and batch
router.get('/', async (req, res) => {
  try {
    const { date, batch } = req.query;
    const where = {};
    
    if (date) {
      where.date = date;
    }
    
    if (batch && batch !== 'all') {
      where['$student.batch$'] = batch;
    }

    const attendance = await Attendance.findAll({
      where,
      include: [{
        model: Student,
        as: 'student',
        attributes: ['id', 'name', 'batch']
      }]
    });

    console.log('Fetched attendance:', attendance);
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});

// Get attendance history for a date range
router.get('/history', async (req, res) => {
  try {
    const { startDate, endDate, batch } = req.query;
    const where = {};
    
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    if (batch && batch !== 'all') {
      where['$student.batch$'] = batch;
    }

    const attendance = await Attendance.findAll({
      where,
      include: [{
        model: Student,
        as: 'student',
        attributes: ['id', 'name', 'batch']
      }]
    });

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({ message: 'Error fetching attendance history' });
  }
});

// Mark attendance for students
router.post('/', async (req, res) => {
  try {
    console.log('Received attendance data:', req.body);
    const { date, records } = req.body;
    
    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request format'
      });
    }

    console.log('Processing attendance for date:', date);
    
    // First, find existing records for this date and these students
    const studentIds = records.map(r => r.studentId);
    const existingRecords = await Attendance.findAll({
      where: {
        date: date,
        studentId: {
          [Op.in]: studentIds
        }
      }
    });

    console.log('Existing records:', existingRecords);

    // Update existing records and create new ones
    for (const record of records) {
      const existing = existingRecords.find(er => 
        er.studentId === record.studentId && 
        er.date === date
      );

      if (existing) {
        console.log('Updating existing record:', existing.id);
        await Attendance.update(
          { status: record.status },
          { where: { id: existing.id } }
        );
      } else {
        console.log('Creating new record:', record);
        await Attendance.create({
          id: record.id,
          studentId: record.studentId,
          date: date,
          status: record.status,
          remarks: record.remarks || null
        });
      }
    }

    // Fetch and return updated records
    const updatedRecords = await Attendance.findAll({
      where: {
        date: date,
        studentId: {
          [Op.in]: studentIds
        }
      },
      include: [{
        model: Student,
        as: 'student',
        attributes: ['id', 'name', 'batch']
      }]
    });

    console.log('Updated records:', updatedRecords);

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      data: updatedRecords
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message
    });
  }
});

// Update individual attendance
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('Updating attendance record:', id, status);

    const attendance = await Attendance.findByPk(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    await attendance.update({ status });
    
    const updated = await Attendance.findByPk(id, {
      include: [{
        model: Student,
        as: 'student',
        attributes: ['id', 'name', 'batch']
      }]
    });

    console.log('Updated attendance:', updated);

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating attendance',
      error: error.message
    });
  }
});

module.exports = router; 