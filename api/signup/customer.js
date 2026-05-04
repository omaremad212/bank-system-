import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nationalId, firstName, lastName, gender, street, area, state, dateOfBirth, password } = request.body;

    // Validation
    if (!nationalId || nationalId.trim() === '') {
      return response.status(400).json({ error: 'National ID is required' });
    }
    if (!firstName || firstName.trim() === '') {
      return response.status(400).json({ error: 'First name is required' });
    }
    if (!lastName || lastName.trim() === '') {
      return response.status(400).json({ error: 'Last name is required' });
    }
    if (!password || password.trim() === '') {
      return response.status(400).json({ error: 'Password is required' });
    }

    // Check if national ID already exists
    const existingCheck = await pool.query(
      'SELECT customerid FROM customer WHERE nationalid = $1',
      [nationalId]
    );

    if (existingCheck.rows.length > 0) {
      return response.status(409).json({ error: 'National ID already registered' });
    }

    // Insert new customer
    const result = await pool.query(
      `INSERT INTO customer (nationalid, firstname, lastname, gender, street, area, state, dateofbirth, password)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING customerid, nationalid, firstname, lastname`,
      [
        nationalId,
        firstName,
        lastName,
        gender || 'Male',
        street || null,
        area || null,
        state || null,
        dateOfBirth || null,
        password
      ]
    );

    const customer = result.rows[0];

    return response.status(201).json({
      success: true,
      message: 'Customer account created successfully',
      customer: {
        id: customer.customerid,
        nationalId: customer.nationalid,
        name: `${customer.firstname} ${customer.lastname}`
      }
    });

  } catch (error) {
    console.error('Customer signup error:', error);
    return response.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  }
}