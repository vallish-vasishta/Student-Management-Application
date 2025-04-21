const Student = require('../models/Student');
const seedData = require('./seedData');

const seedDatabase = async () => {
  try {
    // Clear existing records
    await Student.destroy({ where: {} });
    console.log('Existing records cleared.');

    // Insert seed data
    await Student.bulkCreate(seedData);
    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

module.exports = seedDatabase; 