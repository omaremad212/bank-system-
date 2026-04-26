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
    const result = await pool.query('SELECT branchid, branchname, location, email, establishedyear FROM branch ORDER BY branchid');

    const branches = result.rows.map(row => ({
      // PascalCase
      BranchID: row.branchid,
      BranchName: row.branchname,
      Location: row.location,
      Email: row.email,
      EstablishedYear: row.establishedyear,
      // lowercase
      branchid: row.branchid,
      branchname: row.branchname,
      location: row.location,
      email: row.email,
      establishedyear: row.establishedyear,
    }));

    return response.status(200).json(branches);
  } catch (error) {
    console.error('Get branches error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}