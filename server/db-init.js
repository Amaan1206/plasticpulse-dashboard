/**
 * Database initialization script
 * Run: node db-init.js
 * Creates the plasticpulse database and all tables.
 */

import pg from 'pg'
const { Client } = pg

const DB_NAME = process.env.PGDATABASE || 'plasticpulse'
const PG_USER = process.env.PGUSER || process.env.USER || process.env.USERNAME || 'postgres'
const PG_HOST = process.env.PGHOST || '127.0.0.1'
const PG_PORT = Number(process.env.PGPORT || 5432)
const PG_PASSWORD = process.env.PGPASSWORD || undefined

function quoteIdentifier(value) {
  return `"${String(value).replace(/"/g, '""')}"`
}

async function init() {
  // First connect to default 'postgres' db to create our database
  const rootClient = new Client({
    user: PG_USER,
    host: PG_HOST,
    database: 'postgres',
    port: PG_PORT,
    password: PG_PASSWORD,
  })

  try {
    await rootClient.connect()
    
    // Check if database exists
    const dbCheck = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]
    )

    if (dbCheck.rows.length === 0) {
      await rootClient.query(`CREATE DATABASE ${quoteIdentifier(DB_NAME)}`)
      console.log(`✅ Created database: ${DB_NAME}`)
    } else {
      console.log(`📂 Database "${DB_NAME}" already exists`)
    }
  } finally {
    await rootClient.end()
  }

  // Now connect to our database and create tables
  const client = new Client({
    user: PG_USER,
    host: PG_HOST,
    database: DB_NAME,
    port: PG_PORT,
    password: PG_PASSWORD,
  })

  try {
    await client.connect()

    // Scans table — each scan is a permanent log entry
    await client.query(`
      CREATE TABLE IF NOT EXISTS scans (
        id              SERIAL PRIMARY KEY,
        scan_id         VARCHAR(64) UNIQUE NOT NULL,
        device_id       VARCHAR(50) NOT NULL,
        timestamp       TIMESTAMPTZ DEFAULT NOW(),
        plastic_type    VARCHAR(20),
        resin_code      INTEGER,
        confidence      FLOAT,
        contaminated    BOOLEAN DEFAULT FALSE,
        correct_bin     BOOLEAN DEFAULT TRUE,
        fill_level_pct  INTEGER,
        location_name   VARCHAR(100),
        lat             FLOAT,
        lng             FLOAT,
        image_base64    TEXT,
        composition     JSONB DEFAULT '{}',
        drive_id        VARCHAR(50),
        api_key_used    VARCHAR(20)
      )
    `)
    console.log('✅ Table: scans')

    // Bins table — current bin status
    await client.query(`
      CREATE TABLE IF NOT EXISTS bins (
        device_id         VARCHAR(50) PRIMARY KEY,
        location_name     VARCHAR(100),
        lat               FLOAT,
        lng               FLOAT,
        fill_level_pct    INTEGER DEFAULT 0,
        last_detection    TIMESTAMPTZ,
        top_plastic_type  VARCHAR(20),
        fill_history_24h  JSONB DEFAULT '[]'
      )
    `)
    console.log('✅ Table: bins')

    // Drives table — cleanup drives
    await client.query(`
      CREATE TABLE IF NOT EXISTS drives (
        id                VARCHAR(50) PRIMARY KEY,
        title             VARCHAR(200),
        area              VARCHAR(100),
        target_kg         FLOAT,
        collected_kg      FLOAT DEFAULT 0,
        participant_count INTEGER DEFAULT 0,
        date              DATE,
        status            VARCHAR(20) DEFAULT 'upcoming',
        lat               FLOAT,
        lng               FLOAT
      )
    `)
    console.log('✅ Table: drives')

    // Indexes for fast queries
    await client.query(`CREATE INDEX IF NOT EXISTS idx_scans_device ON scans(device_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_scans_timestamp ON scans(timestamp DESC)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_scans_plastic ON scans(plastic_type)`)
    console.log('✅ Indexes created')

    console.log('')
    console.log('🎉 Database initialization complete!')
    console.log(`   Database: ${DB_NAME}`)
    console.log(`   Tables: scans, bins, drives`)
    console.log('')

  } finally {
    await client.end()
  }
}

init().catch(err => {
  console.error('❌ Database initialization failed:', err.code || err.message || String(err))
  console.error('')
  console.error('Make sure PostgreSQL is running:')
  console.error('  brew services start postgresql@16')
  process.exit(1)
})
