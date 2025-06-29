const bcrypt = require('bcryptjs');
const { User } = require('../models');

async function seedUsers() {
  try {
    console.log('Starting user seeding...');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    if (!existingAdmin) {
      const adminPassword = await bcrypt.hash('mQD6EOg5', 10);
      await User.create({
        username: 'admin',
        password: adminPassword,
        role: 'admin',
        full_name: 'Admin User',
        is_active: true
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Check if trainer user already exists
    const existingTrainer = await User.findOne({ where: { username: 'trainer' } });
    if (!existingTrainer) {
      const trainerPassword = await bcrypt.hash('QY3yO4rM', 10);
      await User.create({
        username: 'trainer',
        password: trainerPassword,
        role: 'trainer',
        full_name: 'Trainer User',
        is_active: true
      });
      console.log('Trainer user created successfully');
    } else {
      console.log('Trainer user already exists');
    }

    console.log('User seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers(); 