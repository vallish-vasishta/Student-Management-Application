const Student = require('./Student');
const Attendance = require('./Attendance');
const Batch = require('./Batch');
const User = require('./User');
const Fee = require('./Fee');
const sequelize = require('../config/database');

// Define associations
Batch.hasMany(Student, {
  foreignKey: 'batchId',
  as: 'students'
});
Student.belongsTo(Batch, {
  foreignKey: 'batchId',
  as: 'batch'
});

Student.hasMany(Attendance, {
  foreignKey: 'studentId',
  as: 'attendance'
});
Attendance.belongsTo(Student, {
  foreignKey: 'studentId',
  as: 'student'
});

module.exports = {
  Student,
  Attendance,
  Batch,
  User,
  Fee
}; 