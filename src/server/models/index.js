const Student = require('./student');
const Attendance = require('./attendance');

// Set up associations
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