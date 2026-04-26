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
    const result = await pool.query('SELECT departmentid, departmentname, branchid FROM department ORDER BY departmentid');

    const departments = result.rows.map(row => ({
      // PascalCase
      DepartmentID: row.departmentid,
      DepartmentName: row.departmentname,
      BranchID: row.branchid,
      // lowercase
      departmentid: row.departmentid,
      departmentname: row.departmentname,
      branchid: row.branchid,
    }));

    return response.status(200).json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}