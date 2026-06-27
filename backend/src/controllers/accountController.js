const User = require('../models/User');
const { formatResponse } = require('../utils/helpers');

exports.getAllAccounts = async (req, res) => {
  try {
    const { search, role, department } = req.query;
    let query = {};
    if (search) { query.$or = [{ fullName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { employeeId: { $regex: search, $options: 'i' } }]; }
    if (role && role !== 'all') query.role = role;
    if (department && department !== 'all') query.department = department;
    const accounts = await User.find(query).select('-password').sort({ createdAt: -1 });
    const accountsWithInitials = accounts.map(account => ({ ...account.toObject(), name: account.fullName, initials: account.firstName[0] + (account.lastName ? account.lastName[0] : ''), status: account.isActive ? 'Active' : 'Inactive' }));
    res.status(200).json(formatResponse(true, 'Accounts fetched successfully', accountsWithInitials));
  } catch (error) { res.status(500).json(formatResponse(false, error.message)); }
};

exports.getRecentAccounts = async (req, res) => {
  try {
    const accounts = await User.find().select('-password').sort({ createdAt: -1 }).limit(10);
    const accountsWithInitials = accounts.map(account => ({ ...account.toObject(), name: account.fullName, initials: account.firstName[0] + (account.lastName ? account.lastName[0] : ''), status: account.isActive ? 'Active' : 'Inactive' }));
    res.status(200).json(formatResponse(true, 'Recent accounts fetched successfully', accountsWithInitials));
  } catch (error) { res.status(500).json(formatResponse(false, error.message)); }
};

exports.getAccountById = async (req, res) => {
  try {
    const account = await User.findById(req.params.id).select('-password');
    if (!account) return res.status(404).json(formatResponse(false, 'Account not found'));
    res.status(200).json(formatResponse(true, 'Account fetched successfully', { ...account.toObject(), name: account.fullName, status: account.isActive ? 'Active' : 'Inactive' }));
  } catch (error) { res.status(500).json(formatResponse(false, error.message)); }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(formatResponse(true, 'Profile fetched successfully', { id: user._id, employeeId: user.employeeId, name: user.fullName, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, role: user.role, department: user.department, designation: user.designation, manager: user.manager, joinDate: user.joinDate, isActive: user.isActive }));
  } catch (error) { res.status(500).json(formatResponse(false, error.message)); }
};

exports.updateAccount = async (req, res) => {
  try {
    const { firstName, lastName, name, email, phone, role, department, designation, manager, joinDate, isActive } = req.body;
    const account = await User.findById(req.params.id);
    if (!account) return res.status(404).json(formatResponse(false, 'Account not found'));
    if (name) { const nameParts = name.trim().split(' '); account.firstName = nameParts[0]; account.lastName = nameParts.slice(1).join(' ') || ''; }
    if (firstName) account.firstName = firstName;
    if (lastName) account.lastName = lastName;
    if (email) account.email = email.toLowerCase();
    if (phone) account.phone = phone;
    if (role) account.role = role;
    if (department) account.department = department;
    if (designation) account.designation = designation;
    if (manager) account.manager = manager;
    if (joinDate) account.joinDate = joinDate;
    if (isActive !== undefined) account.isActive = isActive;
    await account.save();
    res.status(200).json(formatResponse(true, 'Account updated successfully', account));
  } catch (error) { res.status(500).json(formatResponse(false, error.message)); }
};

exports.deleteAccount = async (req, res) => {
  try {
    const account = await User.findById(req.params.id);
    if (!account) return res.status(404).json(formatResponse(false, 'Account not found'));
    if (account.role === 'CEO') return res.status(403).json(formatResponse(false, 'Cannot delete CEO account'));
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json(formatResponse(true, 'Account deleted successfully'));
  } catch (error) { res.status(500).json(formatResponse(false, error.message)); }
};

exports.getAccountStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const roleCounts = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    const roleStats = {}; roleCounts.forEach(r => { roleStats[r._id] = r.count; });
    const thisMonth = new Date().toISOString().slice(0, 7);
    const createdThisMonth = await User.countDocuments({ createdAt: { $regex: `^${thisMonth}` } });
    res.status(200).json(formatResponse(true, 'Stats fetched successfully', { totalCreated: totalUsers, thisMonth: createdThisMonth, byRole: roleStats }));
  } catch (error) { res.status(500).json(formatResponse(false, error.message)); }
};