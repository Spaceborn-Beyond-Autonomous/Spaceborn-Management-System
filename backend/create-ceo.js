const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const createCEO = async () => {
  try {
    // Connect to your MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // First, remove the plain-text user if it exists
    await User.deleteOne({ employeeId: 'CEO' });
    console.log('🗑️ Deleted existing plain-text CEO user');

    // Create the new user properly (Mongoose will trigger the bcrypt pre-save hook)
    const newCEO = new User({
      employeeId: "CEO",
      password: "CEO@123",
      firstName: "Adarsh",
      lastName: "Kumar",
      email: "adarshkumar@spaceborn.in",
      phone: "+91 7759011316",
      role: "CEO",
      department: "Management",
      designation: "CEO",
      team: "Leadership"
    });

    await newCEO.save();
    console.log('✅ CEO user created successfully with an encrypted password!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createCEO();
