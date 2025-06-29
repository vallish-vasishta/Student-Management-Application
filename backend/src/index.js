const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const batchRoutes = require('./routes/batchRoutes');
const feeRoutes = require('./routes/fees');
const authRoutes = require('./routes/authRoutes');
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/auth', authRoutes);

// Database sync and server start
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
}

startServer(); 