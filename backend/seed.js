// seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema (same as in models/User.js)
const userSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true, required: true },
  password: { type: String, required: true, select: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: String,
  role: { type: String, enum: ['CEO', 'Manager', 'Team Lead', 'Member', 'HR'], default: 'Member' },
  department: { type: String, default: 'Engineering' },
  team: String,
  manager: String,
  joinDate: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');

    // Users data with PLAIN passwords (will be hashed on insert)
    const users = [
      { employeeId: 'CEO001', password: 'admin123', firstName: 'John', lastName: 'Doe', email: 'john.doe@spaceborn.com', phone: '+1 555 000 0001', role: 'CEO', department: 'Executive', team: 'Board', manager: 'Board', joinDate: '2020-01-01' },
      { employeeId: 'MGR001', password: 'manager123', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@spaceborn.com', phone: '+1 555 000 0002', role: 'Manager', department: 'Operations', team: 'Management', manager: 'John Doe', joinDate: '2021-03-15' },
      { employeeId: 'LD001', password: 'lead123', firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@spaceborn.com', phone: '+1 555 000 0003', role: 'Team Lead', department: 'Engineering', team: 'Team A', manager: 'Jane Smith', joinDate: '2022-01-10' },
      { employeeId: 'EMP001', password: 'member123', firstName: 'Ravi', lastName: 'Das', email: 'ravi.das@spaceborn.com', phone: '+91 98765 43213', role: 'Member', department: 'Engineering', team: 'Team A', manager: 'Mike Johnson', joinDate: '2024-01-05' },
      { employeeId: 'EMP002', password: 'member123', firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@spaceborn.com', phone: '+91 98765 43210', role: 'Member', department: 'Engineering', team: 'Team A', manager: 'Mike Johnson', joinDate: '2023-01-15' },
      { employeeId: 'EMP003', password: 'member123', firstName: 'Nisha', lastName: 'Kumar', email: 'nisha.kumar@spaceborn.com', phone: '+91 98765 43214', role: 'Member', department: 'Engineering', team: 'Team A', manager: 'Mike Johnson', joinDate: '2023-08-12' },
      { employeeId: 'HR001', password: 'hr123', firstName: 'Neha', lastName: 'Gupta', email: 'neha.gupta@spaceborn.com', phone: '+91 98765 43215', role: 'HR', department: 'HR', team: 'HR Team', manager: 'Jane Smith', joinDate: '2022-06-01' },
    ];

    // Insert users (passwords will be hashed automatically)
    await User.insertMany(users);
    console.log('✅ Seeded 7 users successfully!');

    // Display the users
    const allUsers = await User.find({}).select('-password');
    console.log('\n📋 Users in database:');
    allUsers.forEach(u => {
      console.log(`  - ${u.employeeId}: ${u.firstName} ${u.lastName} (${u.role})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seed();