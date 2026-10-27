const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createPgModel = require('./createPgModel');

const UserModel = createPgModel('users', {
  methods: {
    async comparePassword(enteredPassword) {
      if (!this.password || !enteredPassword) return false;
      return bcrypt.compare(enteredPassword, this.password);
    },
    getSignedJwtToken() {
      return jwt.sign(
        { id: this._id, role: this.role, employeeId: this.employeeId },
        process.env.JWT_SECRET || 'spaceborn-secret-key',
        { expiresIn: process.env.JWT_EXPIRE || '24h' }
      );
    }
  },
  statics: {
    async generateEmployeeId(role) {
      const prefix = role === 'CEO' ? 'CEO' :
                     role === 'COO' ? 'COO' :
                     role === 'Manager' ? 'MGR' :
                     role === 'Team Lead' ? 'LD' :
                     role === 'CO Head' || role === 'Co-Head' ? 'COH' :
                     role === 'HR' ? 'HR' : 'EMP';
      const count = await UserModel.countDocuments({ employeeId: { $regex: `^${prefix}` } });
      return `${prefix}${String(count + 1).padStart(3, '0')}`;
    }
  },
  preSave: [
    async function() {
      if (!this.fullName && (this.firstName || this.lastName)) {
        this.fullName = `${this.firstName || ''} ${this.lastName || ''}`.trim();
      }
      if (this.password && !this.password.startsWith('$2')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      }
      if (this.isActive === undefined) this.isActive = true;
      if (this.isOnline === undefined) this.isOnline = false;
      if (!this.role) this.role = 'Member';
      if (!this.department) this.department = 'Core Systems';
    }
  ]
});

module.exports = UserModel;
