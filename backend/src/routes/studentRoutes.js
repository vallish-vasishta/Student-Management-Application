const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { Op } = require('sequelize');

// Get all students with optional filters
router.get('/', async (req, res) => {
  try {
    const { batch, status, month, searchQuery } = req.query;
    
    let whereClause = {};
    
    if (batch) {
      whereClause.batch = batch;
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
        { batch: { [Op.iLike]: `%${searchQuery}%` } }
      ];
    }
    
    const students = await Student.findAll({
      where: whereClause,
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
      if (!acc[student.batch]) {
        acc[student.batch] = {
          totalStudents: 0,
          paidCount: 0,
          unpaidCount: 0,
          totalAmount: 0,
          collectedAmount: 0,
          pendingAmount: 0
        };
      }
      
      const batch = acc[student.batch];
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

// Add new student
router.post('/', async (req, res) => {
  try {
    console.log('Received request to add student:', req.body);
    
    if (!req.body.name || !req.body.batch || !req.body.feesMonth || !req.body.amount) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['name', 'batch', 'feesMonth', 'amount'],
        received: req.body
      });
    }
    
    const student = await Student.create({
      ...req.body,
      status: req.body.status || 'Unpaid' // Default to 'Unpaid' if not provided
    });
    
    console.log('Successfully created student:', student.toJSON());
    res.status(201).json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors?.map(e => e.message) || [],
      receivedData: req.body
    });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    await student.update(req.body);
    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    console.log('Received request to delete student:', req.params.id);
    
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      console.log('Student not found with ID:', req.params.id);
      return res.status(404).json({ 
        message: 'Student not found',
        requestedId: req.params.id
      });
    }
    
    const studentData = student.toJSON(); // Save data before deletion for logging
    await student.destroy();
    
    console.log('Successfully deleted student:', studentData);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ 
      message: error.message,
      requestedId: req.params.id
    });
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