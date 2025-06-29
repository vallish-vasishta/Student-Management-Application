const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Find user by username
    const user = await User.findOne({ 
      where: { 
        username: username,
        is_active: true 
      } 
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Return user info (without password)
    const userInfo = {
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name
    };

    res.json({
      success: true,
      message: 'Login successful',
      user: userInfo
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'role', 'full_name', 'is_active', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      users: users
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Create new user (admin only)
router.post('/users', async (req, res) => {
  try {
    const { username, password, role, full_name } = req.body;

    if (!username || !password || !role || !full_name) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await User.create({
      username,
      password: hashedPassword,
      role,
      full_name
    });

    // Return user info without password
    const userInfo = {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      full_name: newUser.full_name,
      is_active: newUser.is_active,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userInfo
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Delete user (admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Prevent deleting the last admin user
    if (user.role === 'admin') {
      const adminCount = await User.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot delete the last admin user' 
        });
      }
    }

    // Delete the user
    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router; 