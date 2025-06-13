const express = require('express');
const router2 = express.Router();
const { Attendance, Student, Batch } = require('../models');
const { Op } = require('sequelize');

// Get attendance for a specific date and batch
router2.get('/', async (req, res) => {
  try {
    const { date, batch } = req.query;
    const studentWhere = {};
    if (batch && batch !== 'all') {
      studentWhere.batchId = batch;
    }
    // 1. Get all students for the batch
    const students = await Student.findAll({
      where: studentWhere,
      include: [{
        model: Batch,
        as: 'batch',
        attributes: ['id', 'name', 'timings']
      }]
    });
    // 2. Get attendance records for the date and batch
    const attendanceRecords = await Attendance.findAll({
      where: {
        ...(date ? { date } : {}),
        studentId: { [Op.in]: students.map(s => s.id) }
      }
    });
    // 3. Map attendance by studentId for quick lookup
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.studentId] = record;
    });
    // 4. Build the response: for each student, use attendance record or default absent
    const today = date || new Date().toISOString().slice(0, 10);
    const result = students.map(student => {
      const record = attendanceMap[student.id];
      return {
        id: record ? record.id : null,
        studentId: student.id,
        date: record ? record.date : today,
        status: record ? record.status : 'absent',
        student: student
      };
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});

// Get attendance history for a date range
router2.get('/history', async (req, res) => {
  try {
    const { startDate, endDate, batch } = req.query;
    const where = {};
    
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    if (batch && batch !== 'all') {
      where['$student.batchId$'] = batch;
    }

    const attendance = await Attendance.findAll({
      where,
      include: [{
        model: Student,
        as: 'student',
        attributes: ['id', 'name', 'contact', 'batchId'],
        include: [{
          model: Batch,
          as: 'batch',
          attributes: ['id', 'name', 'timings']
        }]
      }]
    });

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({ message: 'Error fetching attendance history' });
  }
});

// Mark attendance for students
router2.post('/', async (req, res) => {
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
        attributes: ['id', 'name', 'contact', 'batchId'],
        include: [{
          model: Batch,
          as: 'batch',
          attributes: ['id', 'name', 'timings']
        }]
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
router2.put('/:id', async (req, res) => {
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
        attributes: ['id', 'name', 'contact', 'batchId'],
        include: [{
          model: Batch,
          as: 'batch',
          attributes: ['id', 'name', 'timings']
        }]
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

module.exports = router2; 