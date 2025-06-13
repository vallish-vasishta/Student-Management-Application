const express = require('express');
const feeRouter = express.Router();
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const { Op } = require('sequelize');

// Get all fees
feeRouter.get('/', async (req, res) => {
  try {
    const fees = await Fee.findAll({
      include: [{
        model: Student,
        attributes: ['name', 'batchId'],
        include: [{
          model: Batch,
          as: 'batch',
          attributes: ['name']
        }]
      }]
    });
    res.json(fees);
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ error: 'Failed to fetch fees' });
  }
});

// Add new fee record
feeRouter.post('/', async (req, res) => {
  try {
    const { studentId, feesMonth, amount, status, paymentDate, paymentMode } = req.body;
    
    // Validate student exists
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if fee record already exists for this student and month
    const existingFee = await Fee.findOne({
      where: {
        studentId,
        feesMonth
      }
    });

    if (existingFee) {
      return res.status(400).json({ error: 'Fee record already exists for this month' });
    }

    const fee = await Fee.create({
      studentId,
      feesMonth,
      amount,
      status,
      paymentDate: status === 'Paid' ? paymentDate : null,
      paymentMode: status === 'Paid' ? paymentMode : null
    });

    // Fetch the created fee with student and batch details
    const createdFee = await Fee.findByPk(fee.id, {
      include: [{
        model: Student,
        attributes: ['name', 'batchId'],
        include: [{
          model: Batch,
          as: 'batch',
          attributes: ['name']
        }]
      }]
    });

    res.status(201).json(createdFee);
  } catch (error) {
    console.error('Error adding fee:', error);
    res.status(500).json({ error: 'Failed to add fee' });
  }
});

// Update fee record
feeRouter.put('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { feesMonth, amount, status, paymentDate, paymentMode } = req.body;

    const fee = await Fee.findOne({
      where: {
        studentId,
        feesMonth
      }
    });

    if (!fee) {
      return res.status(404).json({ error: 'Fee record not found' });
    }

    await fee.update({
      amount,
      status,
      paymentDate: status === 'Paid' ? paymentDate : null,
      paymentMode: status === 'Paid' ? paymentMode : null
    });

    // Fetch the updated fee with student and batch details
    const updatedFee = await Fee.findOne({
      where: {
        studentId,
        feesMonth
      },
      include: [{
        model: Student,
        attributes: ['name', 'batchId'],
        include: [{
          model: Batch,
          as: 'batch',
          attributes: ['name']
        }]
      }]
    });

    res.json(updatedFee);
  } catch (error) {
    console.error('Error updating fee:', error);
    res.status(500).json({ error: 'Failed to update fee' });
  }
});

// Delete fee record
feeRouter.delete('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { feesMonth } = req.query;

    const fee = await Fee.findOne({
      where: {
        studentId,
        feesMonth
      }
    });

    if (!fee) {
      return res.status(404).json({ error: 'Fee record not found' });
    }

    await fee.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting fee:', error);
    res.status(500).json({ error: 'Failed to delete fee' });
  }
});

// Get fees for a specific student
feeRouter.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const fees = await Fee.findAll({
      where: { studentId },
      include: [{
        model: Student,
        attributes: ['name', 'batchId'],
        include: [{
          model: Batch,
          as: 'batch',
          attributes: ['name']
        }]
      }]
    });
    res.json(fees);
  } catch (error) {
    console.error('Error fetching student fees:', error);
    res.status(500).json({ error: 'Failed to fetch student fees' });
  }
});

// Get fees for a specific month
feeRouter.get('/month/:month', async (req, res) => {
  try {
    const { month } = req.params;
    const startDate = new Date(month);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const fees = await Fee.findAll({
      where: {
        feesMonth: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: Student,
        attributes: ['name', 'batchId'],
        include: [{
          model: Batch,
          as: 'batch',
          attributes: ['name']
        }]
      }]
    });
    res.json(fees);
  } catch (error) {
    console.error('Error fetching monthly fees:', error);
    res.status(500).json({ error: 'Failed to fetch monthly fees' });
  }
});

// Get fees for a specific batch
feeRouter.get('/batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const fees = await Fee.findAll({
      include: [{
        model: Student,
        where: { batchId },
        attributes: ['name', 'batchId'],
        include: [{
          model: Batch,
          as: 'batch',
          attributes: ['name']
        }]
      }]
    });
    res.json(fees);
  } catch (error) {
    console.error('Error fetching batch fees:', error);
    res.status(500).json({ error: 'Failed to fetch batch fees' });
  }
});

module.exports = feeRouter; 