import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { employeeId, password } = request.body;
    
    console.log('Employee login attempt:', { employeeId, password });
    
    if (!employeeId || !password) {
      return response.status(400).json({ message: 'Employee ID and password required' });
    }

    // Handle both string and number employeeId
    const empId = typeof employeeId === 'string' ? parseInt(employeeId) : employeeId;
    
    const result = await pool.query(
      'SELECT * FROM employee WHERE "EmployeeID" = $1',
      [empId]
    );
    
    if (result.rows.length === 0) {
      return response.status(401).json({ message: 'Invalid Employee ID or password' });
    }
    
    const employee = result.rows[0];
    
    // Accept plain text "0000" or bcrypt-hashed "0000"
    let passwordValid = false;
    if (employee.Password) {
      if (employee.Password.startsWith('$2')) {
        try {
          const bcrypt = await import('bcryptjs');
          passwordValid = await bcrypt.compare(password, employee.Password);
        } catch (e) {
          console.error('bcrypt compare error:', e);
          passwordValid = false;
        }
      } else {
        passwordValid = employee.Password === password;
      }
    } else {
      passwordValid = password === '0000';
    }
    
    if (!passwordValid) {
      return response.status(401).json({ message: 'Invalid Employee ID or password' });
    }
    
    const departmentsResult = await pool.query(
      'SELECT * FROM department WHERE "DepartmentID" = $1',
      [employee.DepartmentID]
    );
    const department = departmentsResult.rows[0];
    
    const branchesResult = department ? await pool.query(
      'SELECT * FROM branch WHERE "BranchID" = $1',
      [department.BranchID]
    ) : { rows: [] };
    const branch = branchesResult.rows[0];
    
    const role = await getEmployeeRole(employee.EmployeeID);
    
    const jwt = await import('jsonwebtoken');
    const token = jwt.sign(
      { id: employee.EmployeeID, type: 'employee' },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '24h' }
    );
    
    return response.status(200).json({
      token,
      user: {
        id: employee.EmployeeID,
        type: 'employee',
        name: `${employee.FirstName} ${employee.LastName}`,
        firstName: employee.FirstName,
        lastName: employee.LastName,
        gender: employee.Gender,
        salary: employee.Salary,
        email: employee.Email,
        departmentId: employee.DepartmentID,
        departmentName: department?.DepartmentName,
        branchId: branch?.BranchID,
        branchName: branch?.BranchName,
        ...role,
      }
    });
  } catch (error) {
    console.error('Employee login error:', error);
    return response.status(500).json({ message: 'Login failed. Please try again.' });
  }
}