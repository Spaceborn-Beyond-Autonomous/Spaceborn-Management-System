const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true, required: true },
  password: { type: String, required: true, select: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  fullName: { type: String },
  email: { type: String, unique: true, required: true },
  phone: String,
  role: { type: String, enum: ['CEO', 'COO', 'Manager', 'Team Lead', 'Co-Head', 'CO Head', 'Member', 'HR'], default: 'Member' },
  department: { type: String, default: 'Core Systems' },
  designation: String,
  team: String,
  manager: String,
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  joinDate: { type: String },
  documents: { type: mongoose.Schema.Types.Mixed, default: {} },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdByName: String
}, { timestamps: true });

userSchema.pre('save', function(next) {
  this.fullName = `${this.firstName} ${this.lastName}`;
  next();
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, role: this.role, employeeId: this.employeeId }, process.env.JWT_SECRET || 'spaceborn-secret-key', { expiresIn: process.env.JWT_EXPIRE || '24h' });
};

userSchema.statics.generateEmployeeId = async function(role) {
  const prefix = role === 'CEO' ? 'CEO' : role === 'COO' ? 'COO' : role === 'Manager' ? 'MGR' : role === 'Team Lead' ? 'LD' : role === 'CO Head' || role === 'Co-Head' ? 'COH' : role === 'HR' ? 'HR' : 'EMP';
  const count = await this.countDocuments({ employeeId: { $regex: `^${prefix}` } });
  return `${prefix}${String(count + 1).padStart(3, '0')}`;
};

module.exports = mongoose.model('User', userSchema);
