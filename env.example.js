const { Pool } = require('pg')

const pool = new Pool({
  host: 'aws-0-sa-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.ebezqrsgednjwhajddqu',
  password: 'pQNzoy48T6YNMsik',
  ssl: { rejectUnauthorized: false }
})

// Helper para queries
async function query(text, params) {
  const client = await pool.connect()
  try {
    return await client.query(text, params)
  } finally {
    client.release()
  }
}

module.exports = { query }