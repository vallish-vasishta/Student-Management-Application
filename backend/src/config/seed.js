const { Student } = require('../models/Student');
const seedData = require('./seedData');

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Student.destroy({ where: {} });
    
    // Insert seed data
    await Student.bulkCreate(seedData);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase; 