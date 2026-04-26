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

const getEmployeeRole = async (employeeId) => {
  try {
    const manager = await pool.query('SELECT * FROM manager_details WHERE employeeid = $1', [employeeId]);
    if (manager.rows.length > 0) return { roleType: 'Manager' };
    
    const teller = await pool.query('SELECT * FROM teller_details WHERE employeeid = $1', [employeeId]);
    if (teller.rows.length > 0) return { roleType: 'Teller' };
    
    const clerk = await pool.query('SELECT * FROM clerk_details WHERE employeeid = $1', [employeeId]);
    if (clerk.rows.length > 0) return { roleType: 'Clerk' };
    
    return { roleType: 'Employee' };
  } catch (e) {
    return { roleType: 'Employee' };
  }
};

export default async function handler(request, response) {
  const user = authenticateToken(request);
  
  if (!user || user.type !== 'employee') {
    return response.status(403).json({ message: 'Employee access required' });
  }

  try {
    const result = await pool.query('SELECT employeeid, firstname, lastname, gender, salary, email, departmentid FROM employee');
    
    const employeesWithRole = await Promise.all(result.rows.map(async (employee) => {
      const role = await getEmployeeRole(employee.employeeid);
      const departmentResult = await pool.query('SELECT departmentname FROM department WHERE departmentid = $1', [employee.departmentid]);
      return {
        // PascalCase
        EmployeeID: employee.employeeid,
        FirstName: employee.firstname,
        LastName: employee.lastname,
        Gender: employee.gender,
        Salary: employee.salary,
        Email: employee.email,
        DepartmentID: employee.departmentid,
        ...role,
        DepartmentName: departmentResult.rows[0]?.departmentname,
        // lowercase
        employeeid: employee.employeeid,
        firstname: employee.firstname,
        lastname: employee.lastname,
        gender: employee.gender,
        salary: employee.salary,
        email: employee.email,
        departmentid: employee.departmentid,
        departmentName: departmentResult.rows[0]?.departmentname,
      };
    }));
    
    return response.status(200).json(employeesWithRole);
  } catch (error) {
    console.error('Get employees error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}