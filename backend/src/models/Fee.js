const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Student = require('./Student');

const Fee = sequelize.define('Fee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Students',
      key: 'id'
    }
  },
  feesMonth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Paid', 'Unpaid'),
    defaultValue: 'Unpaid'
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  paymentMode: {
    type: DataTypes.ENUM('Cash', 'UPI', 'Bank Transfer', 'Cheque'),
    allowNull: true
  }
}, {
  timestamps: true
});

// Define association
Fee.belongsTo(Student, { foreignKey: 'studentId' });
Student.hasMany(Fee, { foreignKey: 'studentId' });

module.exports = Fee; 