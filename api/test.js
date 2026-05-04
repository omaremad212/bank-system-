import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(request, response) {
  try {
    const result = await pool.query('SELECT NOW() as time');
    return response.status(200).json({ 
      status: 'ok', 
      time: result.rows[0].time,
      message: 'Database connection successful'
    });
  } catch (error) {
    return response.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
}