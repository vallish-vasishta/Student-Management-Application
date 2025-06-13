'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Fees', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      studentId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Students',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      feesMonth: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Paid', 'Unpaid'),
        defaultValue: 'Unpaid'
      },
      paymentDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      paymentMode: {
        type: Sequelize.ENUM('Cash', 'UPI', 'Bank Transfer', 'Cheque'),
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add unique constraint for studentId and feesMonth
    await queryInterface.addIndex('Fees', ['studentId', 'feesMonth'], {
      unique: true,
      name: 'fees_student_month_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Fees');
  }
}; 