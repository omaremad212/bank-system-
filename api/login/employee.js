import pg from 'pg';
import jwt from 'jsonwebtoken';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const getEmployeeRole = async (employeeId) => {
  try {
    const manager = await pool.query('SELECT * FROM manager_details WHERE employeeid = $1', [employeeId]);
    if (manager.rows.length > 0) return { roleType: 'Manager', ...manager.rows[0] };
    
    const teller = await pool.query('SELECT * FROM teller_details WHERE employeeid = $1', [employeeId]);
    if (teller.rows.length > 0) return { roleType: 'Teller', ...teller.rows[0] };
    
    const clerk = await pool.query('SELECT * FROM clerk_details WHERE employeeid = $1', [employeeId]);
    if (clerk.rows.length > 0) return { roleType: 'Clerk', ...clerk.rows[0] };
    
    return { roleType: 'Employee' };
  } catch (e) {
    return { roleType: 'Employee' };
  }
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { employeeId, password } = request.body;
    
    if (!employeeId || !password) {
      return response.status(400).json({ message: 'Employee ID and password required' });
    }

    const empId = typeof employeeId === 'string' ? parseInt(employeeId) : employeeId;
    
    const result = await pool.query(
      'SELECT * FROM employee WHERE employeeid = $1',
      [empId]
    );
    
    if (result.rows.length === 0) {
      return response.status(401).json({ message: 'Invalid Employee ID or password' });
    }
    
    const employee = result.rows[0];
    
    let passwordValid = false;
    if (employee.password) {
      if (employee.password.startsWith('$2')) {
        try {
          const bcrypt = await import('bcryptjs');
          passwordValid = await bcrypt.compare(password, employee.password);
        } catch (e) {
          passwordValid = false;
        }
      } else {
        passwordValid = employee.password === password;
      }
    } else {
      passwordValid = password === '0000';
    }
    
    if (!passwordValid) {
      return response.status(401).json({ message: 'Invalid Employee ID or password' });
    }
    
    const departmentsResult = await pool.query(
      'SELECT * FROM department WHERE departmentid = $1',
      [employee.departmentid]
    );
    const department = departmentsResult.rows[0];
    
    const branchesResult = department ? await pool.query(
      'SELECT * FROM branch WHERE branchid = $1',
      [department.branchid]
    ) : { rows: [] };
    const branch = branchesResult.rows[0];
    
    const role = await getEmployeeRole(employee.employeeid);
    
    const token = jwt.sign(
      { id: employee.employeeid, type: 'employee', name: `${employee.firstname} ${employee.lastname}` },
      process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '1d' }
    );
    
    return response.status(200).json({
      token,
      user: {
        id: employee.employeeid,
        type: 'employee',
        name: `${employee.firstname} ${employee.lastname}`,
        firstName: employee.firstname,
        lastName: employee.lastname,
        gender: employee.gender,
        salary: employee.salary,
        email: employee.email,
        departmentId: employee.departmentid,
        departmentName: department?.departmentname,
        branchId: branch?.branchid,
        branchName: branch?.branchname,
        ...role,
      }
    });
  } catch (error) {
    console.error('Employee login error:', error);
    return response.status(500).json({ message: 'Login failed. Please try again.' });
  }
}