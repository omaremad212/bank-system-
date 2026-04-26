import pg from 'pg';
import jwt from 'jsonwebtoken';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { nationalId, password } = request.body;
    
    if (!nationalId || !password) {
      return response.status(400).json({ message: 'National ID and password required' });
    }

    const result = await pool.query(
      'SELECT * FROM customer WHERE nationalid = $1',
      [nationalId]
    );
    
    if (result.rows.length === 0) {
      return response.status(401).json({ message: 'Invalid National ID or password' });
    }
    
    const customer = result.rows[0];
    
    let passwordValid = false;
    if (customer.password) {
      if (customer.password.startsWith('$2')) {
        try {
          const bcrypt = await import('bcryptjs');
          passwordValid = await bcrypt.compare(password, customer.password);
        } catch (e) {
          passwordValid = false;
        }
      } else {
        passwordValid = customer.password === password;
      }
    } else {
      passwordValid = password === '0000';
    }
    
    if (!passwordValid) {
      return response.status(401).json({ message: 'Invalid National ID or password' });
    }
    
    const phonesResult = await pool.query(
      'SELECT phone FROM customer_phone WHERE customerid = $1',
      [customer.customerid]
    );
    
    const token = jwt.sign(
      { id: customer.customerid, type: 'customer', nationalId: customer.nationalid },
      process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '1d' }
    );
    
    return response.status(200).json({
      token,
      user: {
        id: customer.customerid,
        type: 'customer',
        name: `${customer.firstname} ${customer.lastname}`,
        nationalId: customer.nationalid,
        firstName: customer.firstname,
        lastName: customer.lastname,
        gender: customer.gender,
        street: customer.street,
        area: customer.area,
        state: customer.state,
        dateOfBirth: customer.dateofbirth,
        phones: phonesResult.rows.map(p => p.phone),
      }
    });
  } catch (error) {
    console.error('Customer login error:', error);
    return response.status(500).json({ message: 'Login failed. Please try again.' });
  }
}