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
    const { firstName, lastName, gender, email, departmentId, password } = request.body;

    // Validation
    if (!firstName || firstName.trim() === '') {
      return response.status(400).json({ error: 'First name is required' });
    }
    if (!lastName || lastName.trim() === '') {
      return response.status(400).json({ error: 'Last name is required' });
    }
    if (!email || email.trim() === '') {
      return response.status(400).json({ error: 'Email is required' });
    }
    if (!password || password.trim() === '') {
      return response.status(400).json({ error: 'Password is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return response.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email already exists
    const existingCheck = await pool.query(
      'SELECT employeeid FROM employee WHERE email = $1',
      [email]
    );

    if (existingCheck.rows.length > 0) {
      return response.status(409).json({ error: 'Email already registered' });
    }

    // Verify department exists
    if (departmentId) {
      const deptCheck = await pool.query(
        'SELECT departmentid FROM department WHERE departmentid = $1',
        [departmentId]
      );
      if (deptCheck.rows.length === 0) {
        return response.status(400).json({ error: 'Invalid department' });
      }
    }

    // Insert new employee
    const result = await pool.query(
      `INSERT INTO employee (firstname, lastname, gender, email, departmentid, password)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING employeeid, firstname, lastname, email`,
      [
        firstName,
        lastName,
        gender || 'Male',
        email,
        departmentId || 1,
        password
      ]
    );

    const employee = result.rows[0];

    return response.status(201).json({
      success: true,
      message: 'Employee account created successfully',
      employee: {
        id: employee.employeeid,
        name: `${employee.firstname} ${employee.lastname}`,
        email: employee.email
      }
    });

  } catch (error) {
    console.error('Employee signup error:', error);
    return response.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  }
}