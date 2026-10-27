const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const { PGlite } = require('@electric-sql/pglite');

let db = null;
let isConnected = false;

const TABLES = [
  'users',
  'attendance',
  'leaves',
  'leave_balances',
  'tasks',
  'projects',
  'roadmaps',
  'meetings',
  'reports',
  'notifications',
  'resources',
  'resource_requests',
  'executive_decisions',
  'holidays',
  'hour_breaks',
  'login_attempts',
  'password_reset_requests',
  'sessions'
];

async function getDb() {
  if (db) return db;
  await connectDB();
  return db;
}

async function query(text, params = []) {
  const client = await getDb();
  return client.query(text, params);
}

async function exec(sql) {
  const client = await getDb();
  if (typeof client.exec === 'function') {
    return client.exec(sql);
  }
  return client.query(sql);
}

async function connectDB() {
  if (isConnected && db) return db;

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    console.log('🔌 Connecting to PostgreSQL via DATABASE_URL (Render / Cloud)...');
    db = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  } else {
    const dataDir = path.resolve(__dirname, '../../data/spaceborn_pgdata');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    console.log(`💾 Starting embedded PGlite database at ${dataDir}...`);
    db = new PGlite(dataDir);
  }

  // Create tables
  for (const table of TABLES) {
    await exec(`
      CREATE TABLE IF NOT EXISTS ${table} (
        id VARCHAR(64) PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_${table}_data ON ${table} USING gin (data);
    `);
  }

  isConnected = true;
  console.log('✅ PostgreSQL Schema Initialized (18 Tables Ready)');

  // Auto-seed if users table is empty
  try {
    const userRes = await query('SELECT count(*) as count FROM users');
    const count = parseInt(userRes.rows[0]?.count || 0, 10);
    if (count === 0) {
      console.log('🌱 No users found. Auto-seeding initial users...');
      const seed = require('../../seed');
      if (typeof seed.runSeed === 'function') {
        await seed.runSeed();
      }
    }
  } catch (err) {
    console.warn('⚠️ Auto-seed check warning:', err.message);
  }

  return db;
}

module.exports = connectDB;
module.exports.getDb = getDb;
module.exports.query = query;
module.exports.exec = exec;
module.exports.connectDB = connectDB;
