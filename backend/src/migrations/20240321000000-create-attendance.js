'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Attendances', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      studentId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Students',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('present', 'absent', 'late'),
        allowNull: false,
        defaultValue: 'present'
      },
      remarks: {
        type: Sequelize.STRING,
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

    // Add a unique constraint for studentId and date combination
    await queryInterface.addIndex('Attendances', ['studentId', 'date'], {
      unique: true,
      name: 'attendance_student_date_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Attendances');
  }
}; 