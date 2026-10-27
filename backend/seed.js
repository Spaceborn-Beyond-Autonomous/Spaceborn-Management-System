// seed.js - Seeds initial data into PostgreSQL (PGlite / Render Postgres)
require('dotenv').config();
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Task = require('./src/models/Task');
const ExecutiveDecision = require('./src/models/ExecutiveDecision');

const INITIAL_USERS = [
  {
    employeeId: 'CEO001',
    password: 'admin123',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    email: 'john.doe@spaceborn.com',
    phone: '+1 555 000 0001',
    role: 'CEO',
    department: 'Platform and DevOps',
    team: 'Board',
    manager: 'Board',
    joinDate: '2020-01-01',
    status: 'Active'
  },
  {
    employeeId: 'COO001',
    password: 'coo123',
    firstName: 'Aarav',
    lastName: 'Mehta',
    fullName: 'Aarav Mehta',
    email: 'aarav.mehta@spaceborn.com',
    phone: '+1 555 000 0008',
    role: 'COO',
    department: 'Platform and DevOps',
    team: 'Management',
    manager: 'John Doe',
    joinDate: '2021-01-10',
    status: 'Active'
  },
  {
    employeeId: 'MGR001',
    password: 'manager123',
    firstName: 'Jane',
    lastName: 'Smith',
    fullName: 'Jane Smith',
    email: 'jane.smith@spaceborn.com',
    phone: '+1 555 000 0002',
    role: 'Manager',
    department: 'Platform and DevOps',
    team: 'Management',
    manager: 'John Doe',
    joinDate: '2021-03-15',
    status: 'Active'
  },
  {
    employeeId: 'LD001',
    password: 'lead123',
    firstName: 'Mike',
    lastName: 'Johnson',
    fullName: 'Mike Johnson',
    email: 'mike.johnson@spaceborn.com',
    phone: '+1 555 000 0003',
    role: 'Team Lead',
    department: 'Core Systems',
    team: 'Team A',
    manager: 'Jane Smith',
    joinDate: '2022-01-10',
    status: 'Active'
  },
  {
    employeeId: 'EMP001',
    password: 'member123',
    firstName: 'Ravi',
    lastName: 'Das',
    fullName: 'Ravi Das',
    email: 'ravi.das@spaceborn.com',
    phone: '+91 98765 43213',
    role: 'Member',
    department: 'Core Systems',
    team: 'Team A',
    manager: 'Mike Johnson',
    joinDate: '2024-01-05',
    status: 'Active'
  },
  {
    employeeId: 'EMP002',
    password: 'member123',
    firstName: 'Priya',
    lastName: 'Sharma',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@spaceborn.com',
    phone: '+91 98765 43210',
    role: 'Member',
    department: 'Core Systems',
    team: 'Team A',
    manager: 'Mike Johnson',
    joinDate: '2023-01-15',
    status: 'Active'
  },
  {
    employeeId: 'HR001',
    password: 'hr123',
    firstName: 'Neha',
    lastName: 'Gupta',
    fullName: 'Neha Gupta',
    email: 'neha.gupta@spaceborn.com',
    phone: '+91 98765 43215',
    role: 'HR',
    department: 'Robotics & Simulation',
    team: 'People Operations',
    manager: 'Jane Smith',
    joinDate: '2022-06-01',
    status: 'Active'
  }
];

const INITIAL_TASKS = [
  {
    title: 'Deploy Core Systems Microservice',
    description: 'Finalize and deploy core telemetry microservice to staging',
    assignedToName: 'Ravi Das',
    department: 'Core Systems',
    priority: 'high',
    status: 'In progress',
    dueDate: '2026-11-15',
    progress: 60
  },
  {
    title: 'Autonomous Navigation Testing',
    description: 'Run simulation suite for obstacle detection and path planning',
    assignedToName: 'Priya Sharma',
    department: 'Core Systems',
    priority: 'medium',
    status: 'Pending',
    dueDate: '2026-11-20',
    progress: 25
  }
];

const INITIAL_DECISIONS = [
  {
    title: 'Transition to PostgreSQL Architecture',
    description: 'Migrate internal storage to embedded PGlite locally and Render Managed PostgreSQL for cloud hosting.',
    category: 'Strategic',
    impact: 'High',
    status: 'Implemented'
  }
];

async function runSeed() {
  await connectDB();
  console.log('🌱 Seeding PostgreSQL database...');

  await User.deleteMany({});
  for (const user of INITIAL_USERS) {
    await User.create(user);
  }
  console.log(`✅ Seeded ${INITIAL_USERS.length} users`);

  await Task.deleteMany({});
  for (const task of INITIAL_TASKS) {
    await Task.create(task);
  }
  console.log(`✅ Seeded ${INITIAL_TASKS.length} sample tasks`);

  await ExecutiveDecision.deleteMany({});
  for (const dec of INITIAL_DECISIONS) {
    await ExecutiveDecision.create(dec);
  }
  console.log(`✅ Seeded ${INITIAL_DECISIONS.length} sample executive decisions`);

  console.log('🎉 Seeding complete!');
}

if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = { runSeed };
