import pg from 'pg'

const { Client } = pg

const DB_NAME = process.env.PGDATABASE || 'plasticpulse'
const PG_USER = process.env.PGUSER || process.env.USER || process.env.USERNAME || 'postgres'
const PG_HOST = process.env.PGHOST || '127.0.0.1'
const PG_PORT = Number(process.env.PGPORT || 5432)
const PG_PASSWORD = process.env.PGPASSWORD || undefined

async function clearDatabase() {
  const client = new Client({
    user: PG_USER,
    host: PG_HOST,
    database: DB_NAME,
    port: PG_PORT,
    password: PG_PASSWORD,
  })

  try {
    await client.connect()
    await client.query('TRUNCATE TABLE scans, bins RESTART IDENTITY')
    console.log('✅ Cleared scans and bins tables')
  } finally {
    await client.end()
  }
}

clearDatabase().catch((err) => {
  console.error('❌ Failed to clear database:', err.code || err.message || String(err))
  process.exit(1)
})
