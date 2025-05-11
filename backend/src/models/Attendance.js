'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
const Student = require('./Student');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    defaultValue: () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late'),
    allowNull: false,
    defaultValue: 'absent'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

// Define association with Student model
Attendance.belongsTo(Student, {
  foreignKey: 'studentId',
  onDelete: 'CASCADE'
});

module.exports = Attendance; 