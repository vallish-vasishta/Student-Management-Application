const express = require('express');
const cors = require('cors');
const studentRoutes = require('./routes/students');
const batchRoutes = require('./routes/batches');
const attendanceRoutes = require('./routes/attendance');
const feeRoutes = require('./routes/fees');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/students', studentRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);

module.exports = app; 