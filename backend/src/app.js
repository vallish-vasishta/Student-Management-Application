const express = require('express');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);

module.exports = app; 