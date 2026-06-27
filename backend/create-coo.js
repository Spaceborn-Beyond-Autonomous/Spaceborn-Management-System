const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const createCOO = async () => {
  try {
    // Connect to your MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // First, remove the plain-text user if it exists
    await User.deleteOne({ employeeId: 'COO001' });
    console.log('🗑️ Deleted existing plain-text COO user');

    // Create the new user properly (Mongoose will trigger the bcrypt pre-save hook)
    const newCOO = new User({
      employeeId: "COO001",
      password: "admin123",
      firstName: "Alex",
      lastName: "Kim",
      email: "alex.kim@spaceborn.in",
      phone: "+91 1234567890",
      role: "COO",
      department: "Founding Team",
      designation: "COO",
      team: "Leadership"
    });

    await newCOO.save();
    console.log('✅ COO user created successfully with an encrypted password!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createCOO();
