const express = require('express');
const router = express.Router();
const { Student, Batch } = require('../models');
const { Op } = require('sequelize');

// Get all students (with batch info)
router.get('/', async (req, res) => {
  try {
    const students = await Student.findAll({ include: [{ model: Batch, as: 'batch' }] });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get student by id
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, { include: [{ model: Batch, as: 'batch' }] });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all students with optional filters
router.get('/filter', async (req, res) => {
  try {
    const { batch, status, month, searchQuery } = req.query;
    
    let whereClause = {};
    
    if (batch) {
      whereClause.batchId = batch;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (month) {
      whereClause.feesMonth = month;
    }
    
    if (searchQuery) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${searchQuery}%` } },
        { batchId: { [Op.iLike]: `%${searchQuery}%` } }
      ];
    }
    
    const students = await Student.findAll({
      where: whereClause,
      include: [{ model: Batch, as: 'batch' }],
      order: [['feesMonth', 'DESC'], ['name', 'ASC']]
    });
    
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get batch summary
router.get('/batch-summary', async (req, res) => {
  try {
    const { month } = req.query;
    
    let whereClause = {};
    if (month) {
      whereClause.feesMonth = month;
    }
    
    const students = await Student.findAll({ where: whereClause });
    
    const batchSummary = students.reduce((acc, student) => {
      if (!acc[student.batchId]) {
        acc[student.batchId] = {
          totalStudents: 0,
          paidCount: 0,
          unpaidCount: 0,
          totalAmount: 0,
          collectedAmount: 0,
          pendingAmount: 0
        };
      }
      
      const batch = acc[student.batchId];
      batch.totalStudents++;
      batch.totalAmount += student.amount;
      
      if (student.status === 'Paid') {
        batch.paidCount++;
        batch.collectedAmount += student.amount;
      } else {
        batch.unpaidCount++;
        batch.pendingAmount += student.amount;
      }
      
      return acc;
    }, {});
    
    res.json(batchSummary);
  } catch (error) {
    console.error('Error generating batch summary:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get monthly summary
router.get('/monthly-summary', async (req, res) => {
  try {
    const students = await Student.findAll({
      attributes: [
        'feesMonth',
        [Student.sequelize.fn('COUNT', Student.sequelize.col('*')), 'totalStudents'],
        [Student.sequelize.fn('SUM', Student.sequelize.col('amount')), 'totalAmount'],
        [
          Student.sequelize.fn(
            'SUM',
            Student.sequelize.literal("CASE WHEN status = 'Paid' THEN amount ELSE 0 END")
          ),
          'collectedAmount'
        ]
      ],
      group: ['feesMonth'],
      order: [['feesMonth', 'DESC']]
    });
    
    const monthlySummary = students.map(summary => ({
      ...summary.get({ plain: true }),
      pendingAmount: summary.get('totalAmount') - summary.get('collectedAmount')
    }));
    
    res.json(monthlySummary);
  } catch (error) {
    console.error('Error generating monthly summary:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create student
router.post('/', async (req, res) => {
  try {
    const { id, name, batchId, contact } = req.body;
    const student = await Student.create({ id, name, batchId, contact });
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { name, batchId, contact } = req.body;
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    student.name = name;
    student.batchId = batchId;
    student.contact = contact;
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    await student.destroy();
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark student as paid
router.patch('/:id/status', async (req, res) => {
  try {
    console.log('PATCH request received for student ID:', req.params.id);
    console.log('Request body:', req.body);

    const student = await Student.findOne({
      where: { id: req.params.id }
    });

    if (!student) {
      console.log('Student not found with ID:', req.params.id);
      return res.status(404).json({ 
        message: 'Student not found',
        requestedId: req.params.id
      });
    }

    console.log('Found student:', student.toJSON());

    const updatedStudent = await student.update({
      status: req.body.status
    });

    console.log('Updated student:', updatedStudent.toJSON());

    res.json(updatedStudent);
  } catch (error) {
    console.error('Error updating student status:', error);
    res.status(400).json({ 
      message: error.message,
      requestedId: req.params.id,
      requestBody: req.body
    });
  }
});

module.exports = router; 