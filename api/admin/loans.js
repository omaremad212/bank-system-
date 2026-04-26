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
    const result = await pool.query('SELECT applicationid, appdate, startdate, enddate, approvedamt, status, customerid FROM loan_application ORDER BY appdate DESC');

    const loans = result.rows.map(row => ({
      // PascalCase
      ApplicationID: row.applicationid,
      AppDate: row.appdate,
      StartDate: row.startdate,
      EndDate: row.enddate,
      ApprovedAmt: row.approvedamt,
      Status: row.status,
      CustomerID: row.customerid,
      // lowercase
      applicationid: row.applicationid,
      appdate: row.appdate,
      startdate: row.startdate,
      enddate: row.enddate,
      approvedamt: row.approvedamt,
      status: row.status,
      customerid: row.customerid,
    }));

    return response.status(200).json(loans);
  } catch (error) {
    console.error('Get loans error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}