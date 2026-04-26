import { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const authenticateToken = async (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return null;
  
  try {
    const jwt = await import('jsonwebtoken');
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
  } catch (e) {
    return null;
  }
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const user = await authenticateToken(request);
  
  if (!user || user.type !== 'employee') {
    return response.status(403).json({ message: 'Employee access required' });
  }

  try {
    const result = await pool.query('SELECT * FROM customer');
    
    const customersWithPhones = await Promise.all(result.rows.map(async (customer) => {
      const phonesResult = await pool.query(
        'SELECT phone FROM customer_phone WHERE customerid = $1',
        [customer.customerid]
      );
      return { ...customer, phones: phonesResult.rows.map(p => p.phone) };
    }));
    
    return response.status(200).json(customersWithPhones);
  } catch (error) {
    console.error('Get customers error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}