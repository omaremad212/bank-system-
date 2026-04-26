import pg from 'pg';
import jwt from 'jsonwebtoken';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const authenticateToken = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret');
  } catch (e) {
    return null;
  }
};

export default async function handler(request, response) {
  const user = authenticateToken(request);
  if (!user || user.type !== 'employee') {
    return response.status(403).json({ message: 'Employee access required' });
  }

  try {
    const result = await pool.query('SELECT atmid, location, installdate, status, branchid FROM atm ORDER BY atmid');

    const atms = result.rows.map(row => ({
      // PascalCase
      ATMID: row.atmid,
      Location: row.location,
      InstallDate: row.installdate,
      Status: row.status,
      BranchID: row.branchid,
      // lowercase
      atmid: row.atmid,
      location: row.location,
      installdate: row.installdate,
      status: row.status,
      branchid: row.branchid,
    }));

    return response.status(200).json(atms);
  } catch (error) {
    console.error('Get ATMs error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}