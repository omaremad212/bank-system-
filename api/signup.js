import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  const { role, ...data } = request.body;

  if (!role || !['customer', 'employee'].includes(role)) {
    return response.status(400).json({ message: 'Role is required (customer or employee)' });
  }

  try {
    if (role === 'customer') {
      const { nationalId, firstName, lastName, gender, street, area, state, dateOfBirth, password } = data;

      if (!nationalId || !firstName || !lastName || !password) {
        return response.status(400).json({ message: 'Required fields missing' });
      }

      const existing = await pool.query('SELECT customerid FROM customer WHERE nationalid = $1', [nationalId]);
      if (existing.rows.length > 0) {
        return response.status(400).json({ message: 'National ID already registered' });
      }

      const result = await pool.query(
        `INSERT INTO customer (nationalid, firstname, lastname, gender, street, area, state, dateofbirth, password)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING customerid`,
        [nationalId, firstName, lastName, gender, street, area, state, dateOfBirth, password]
      );

      return response.status(201).json({ 
        message: 'Customer account created',
        userId: result.rows[0].customerid,
        role: 'customer'
      });
    }

    if (role === 'employee') {
      const { firstName, lastName, gender, email, departmentId, password } = data;

      if (!firstName || !lastName || !email || !password) {
        return response.status(400).json({ message: 'Required fields missing' });
      }

      const existing = await pool.query('SELECT employeeid FROM employee WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return response.status(400).json({ message: 'Email already registered' });
      }

      const result = await pool.query(
        `INSERT INTO employee (firstname, lastname, gender, email, departmentid, password)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING employeeid`,
        [firstName, lastName, gender, email, departmentId || 1, password]
      );

      return response.status(201).json({ 
        message: 'Employee account created',
        userId: result.rows[0].employeeid,
        role: 'employee'
      });
    }

    return response.status(400).json({ message: 'Invalid role' });
  } catch (error) {
    console.error('Signup error:', error);
    return response.status(500).json({ message: 'Registration failed' });
  }
}