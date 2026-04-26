import pg from 'pg';

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
      'SELECT * FROM customer WHERE "NationalID" = $1',
      [nationalId]
    );
    
    if (result.rows.length === 0) {
      return response.status(401).json({ message: 'Invalid National ID' });
    }
    
    const customer = result.rows[0];
    
    let passwordValid = false;
    if (customer.Password) {
      const bcrypt = await import('bcryptjs');
      passwordValid = await bcrypt.compare(password, customer.Password);
    } else {
      passwordValid = password === '0000';
    }
    
    if (!passwordValid) {
      return response.status(401).json({ message: 'Invalid password' });
    }
    
    const phonesResult = await pool.query(
      'SELECT "Phone" FROM customer_phone WHERE "CustomerID" = $1',
      [customer.CustomerID]
    );
    
    const jwt = await import('jsonwebtoken');
    const token = jwt.sign(
      { id: customer.CustomerID, type: 'customer', nationalId: customer.NationalID },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '24h' }
    );
    
    return response.status(200).json({
      token,
      user: {
        id: customer.CustomerID,
        type: 'customer',
        name: `${customer.FirstName} ${customer.LastName}`,
        nationalId: customer.NationalID,
        firstName: customer.FirstName,
        lastName: customer.LastName,
        gender: customer.Gender,
        street: customer.Street,
        area: customer.Area,
        state: customer.State,
        dateOfBirth: customer.DateOfBirth,
        phones: phonesResult.rows.map(p => p.Phone),
      }
    });
  } catch (error) {
    console.error('Customer login error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}