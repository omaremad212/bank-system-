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
    console.log('Auth error:', e);
    return null;
  }
};

const getEmployeeRole = async (employeeId) => {
  try {
    const manager = await pool.query('SELECT * FROM manager_details WHERE "EmployeeID" = $1', [employeeId]);
    if (manager.rows.length > 0) return { roleType: 'Manager', ...manager.rows[0] };
    
    const teller = await pool.query('SELECT * FROM teller_details WHERE "EmployeeID" = $1', [employeeId]);
    if (teller.rows.length > 0) return { roleType: 'Teller', ...teller.rows[0] };
    
    const clerk = await pool.query('SELECT * FROM clerk_details WHERE "EmployeeID" = $1', [employeeId]);
    if (clerk.rows.length > 0) return { roleType: 'Clerk', ...clerk.rows[0] };
    
    return { roleType: 'Employee' };
  } catch (e) {
    console.log('getEmployeeRole error:', e);
    return { roleType: 'Employee' };
  }
};

export default async function handler(request, response) {
  const user = await authenticateToken(request);
  
  if (!user || user.type !== 'employee') {
    return response.status(403).json({ message: 'Employee access required' });
  }

  try {
    const result = await pool.query('SELECT * FROM employee');
    
    const employeesWithRole = await Promise.all(result.rows.map(async (employee) => {
      const role = await getEmployeeRole(employee.EmployeeID);
      const departmentResult = await pool.query('SELECT * FROM department WHERE "DepartmentID" = $1', [employee.DepartmentID]);
      return {
        ...employee,
        ...role,
        departmentName: departmentResult.rows[0]?.DepartmentName,
      };
    }));
    
    return response.status(200).json(employeesWithRole);
  } catch (error) {
    console.error('Get employees error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}