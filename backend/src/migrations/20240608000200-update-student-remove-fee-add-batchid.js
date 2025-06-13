'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Students', 'feesMonth');
    await queryInterface.removeColumn('Students', 'amount');
    await queryInterface.removeColumn('Students', 'status');
    await queryInterface.addColumn('Students', 'batchId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Batches',
        key: 'id'
      }
    });
    await queryInterface.addColumn('Students', 'contact', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Students', 'feesMonth', {
      type: Sequelize.DATE,
      allowNull: false
    });
    await queryInterface.addColumn('Students', 'amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    });
    await queryInterface.addColumn('Students', 'status', {
      type: Sequelize.ENUM('Paid', 'Unpaid'),
      allowNull: false,
      defaultValue: 'Unpaid'
    });
    await queryInterface.removeColumn('Students', 'batchId');
    await queryInterface.removeColumn('Students', 'contact');
  }
}; 