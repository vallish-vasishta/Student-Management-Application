const Student = require('./Student');
const Attendance = require('./Attendance');
const sequelize = require('../config/database');

// Define associations
Student.hasMany(Attendance, {
  foreignKey: 'studentId',
  as: 'attendance'
});

Attendance.belongsTo(Student, {
  foreignKey: 'studentId',
  as: 'student'
});

sequelize.sync()

module.exports = {
  Student,
  Attendance
}; 