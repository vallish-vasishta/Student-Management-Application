const express = require('express');
const batchRouter = express.Router();
const { Batch } = require('../models');

// Get all batches
batchRouter.get('/', async (req, res) => {
  try {
    const batches = await Batch.findAll();
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get batch by id
batchRouter.get('/:id', async (req, res) => {
  try {
    const batch = await Batch.findByPk(req.params.id);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create batch
batchRouter.post('/', async (req, res) => {
  try {
    const { name, timings } = req.body;
    const batch = await Batch.create({ name, timings });
    res.status(201).json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update batch
batchRouter.put('/:id', async (req, res) => {
  try {
    const { name, timings } = req.body;
    const batch = await Batch.findByPk(req.params.id);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    batch.name = name;
    batch.timings = timings;
    await batch.save();
    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete batch
batchRouter.delete('/:id', async (req, res) => {
  try {
    const batch = await Batch.findByPk(req.params.id);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    await batch.destroy();
    res.json({ message: 'Batch deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = batchRouter; 