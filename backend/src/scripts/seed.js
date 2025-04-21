require('dotenv').config();
const sequelize = require('../config/database');
const { Student } = require('../models/Student');
const seedData = require('../config/seedData');

async function seed() {
  try {
    // Clear existing data
    await sequelize.sync({ force: true });
    console.log('Database cleared');

    // Insert seed data
    await Student.bulkCreate(seedData);
    console.log('Students and their payments created');

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed(); 