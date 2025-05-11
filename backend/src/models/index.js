const Student = require('./Student');
const Attendance = require('./Attendance');

// Define associations
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
  Attendance
}; 