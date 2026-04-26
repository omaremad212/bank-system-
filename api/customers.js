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
    const result = await pool.query('SELECT customerid, nationalid, firstname, lastname, gender, street, area, state, dateofbirth FROM customer');
    
    const customersWithPhones = await Promise.all(result.rows.map(async (customer) => {
      const phonesResult = await pool.query(
        'SELECT phone FROM customer_phone WHERE customerid = $1',
        [customer.customerid]
      );
      return {
        // PascalCase
        CustomerID: customer.customerid,
        NationalID: customer.nationalid,
        FirstName: customer.firstname,
        LastName: customer.lastname,
        Gender: customer.gender,
        Street: customer.street,
        Area: customer.area,
        State: customer.state,
        DateOfBirth: customer.dateofbirth,
        phones: phonesResult.rows.map(p => p.phone),
        // lowercase
        customerid: customer.customerid,
        nationalid: customer.nationalid,
        firstname: customer.firstname,
        lastname: customer.lastname,
        gender: customer.gender,
        street: customer.street,
        area: customer.area,
        state: customer.state,
        dateofbirth: customer.dateofbirth,
      };
    }));
    
    return response.status(200).json(customersWithPhones);
  } catch (error) {
    console.error('Get customers error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}