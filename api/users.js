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

const calculateBalance = async (accountId) => {
  try {
    const result = await pool.query(
      'SELECT COALESCE(SUM(CASE WHEN transactiontype = $1 THEN amount ELSE -amount END), 0) as balance FROM transaction WHERE accountid = $2',
      ['Deposit', accountId]
    );
    return parseFloat(result.rows[0]?.balance || 0);
  } catch (e) {
    return 0;
  }
};

const isManager = (user) => {
  return user.id === 1 || user.name === 'Mohamed Anwar';
};

export default async function handler(request, response) {
  const user = authenticateToken(request);
  if (!user || user.type !== 'employee') {
    return response.status(403).json({ message: 'Employee access required' });
  }

  const action = request.query.action || request.query.action;
  const method = request.method;

  // Check if this is a write operation
  const isWrite = method === 'POST' || method === 'PUT' || method === 'DELETE';
  
  // Only Mohamed Anwar (id=1) can do write operations
  if (isWrite && !isManager(user)) {
    return response.status(403).json({ message: 'Only managers can perform this action' });
  }

  try {
    if (method === 'GET') {
      if (action === 'customers' || !action) {
        const result = await pool.query('SELECT customerid, nationalid, firstname, lastname, gender, street, area, state, dateofbirth FROM customer');
        const customersWithPhones = await Promise.all(result.rows.map(async (customer) => {
          const phonesResult = await pool.query(
            'SELECT phone FROM customer_phone WHERE customerid = $1',
            [customer.customerid]
          );
          return {
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
          };
        }));
        return response.status(200).json(customersWithPhones);
      }

      if (action === 'employees') {
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

        const result = await pool.query('SELECT employeeid, firstname, lastname, gender, salary, email, departmentid FROM employee');
        const employeesWithRole = await Promise.all(result.rows.map(async (employee) => {
          const role = await getEmployeeRole(employee.employeeid);
          const departmentResult = await pool.query('SELECT departmentname FROM department WHERE departmentid = $1', [employee.departmentid]);
          return {
            EmployeeID: employee.employeeid,
            FirstName: employee.firstname,
            LastName: employee.lastname,
            Gender: employee.gender,
            Salary: employee.salary,
            Email: employee.email,
            DepartmentID: employee.departmentid,
            ...role,
            DepartmentName: departmentResult.rows[0]?.departmentname,
          };
        }));
        return response.status(200).json(employeesWithRole);
      }

      if (action === 'accounts') {
        const result = await pool.query(
          `SELECT ba.accountid, ba.accountnumber, ba.opendate, ba.accounttype, ba.customerid, ba.branchid,
                  CASE WHEN sa.accountid IS NOT NULL THEN 'Savings' ELSE 'Checking' END as accounttype
           FROM bank_account ba LEFT JOIN savings_account sa ON ba.accountid = sa.accountid`
        );
        const accountsWithBalance = await Promise.all(result.rows.map(async (account) => {
          const balance = await calculateBalance(account.accountid);
          const customerResult = await pool.query('SELECT firstname, lastname FROM customer WHERE customerid = $1', [account.customerid]);
          const branchResult = await pool.query('SELECT branchname FROM branch WHERE branchid = $1', [account.branchid]);
          return {
            AccountID: account.accountid,
            AccountNumber: account.accountnumber,
            AccountType: account.accounttype,
            OpenDate: account.opendate,
            CustomerID: account.customerid,
            BranchID: account.branchid,
            balance,
            customerName: customerResult.rows[0] ? `${customerResult.rows[0].firstname} ${customerResult.rows[0].lastname}` : null,
            branchName: branchResult.rows[0]?.branchname,
          };
        }));
        return response.status(200).json(accountsWithBalance);
      }
    }

    if (method === 'POST' && action === 'customers') {
      console.log('POST customers received:', request.body);
      const { nationalId, firstName, lastName, gender, street, area, state, dateOfBirth, password, phones } = request.body;
      
      if (!nationalId || !firstName || !lastName) {
        console.log('Missing required fields');
        return response.status(400).json({ message: 'Required fields missing' });
      }
      
      const existing = await pool.query('SELECT customerid FROM customer WHERE nationalid = $1', [nationalId]);
      if (existing.rows.length > 0) {
        return response.status(400).json({ message: 'National ID already exists' });
      }

      const result = await pool.query(
        `INSERT INTO customer (nationalid, firstname, lastname, gender, street, area, state, dateofbirth, password)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING customerid`,
        [nationalId, firstName, lastName, gender, street, area, state, dateOfBirth, password]
      );

      const customerId = result.rows[0].customerid;
      console.log('Customer created with ID:', customerId);
      
      if (phones && phones[0]) {
        await pool.query('INSERT INTO customer_phone (customerid, phone) VALUES ($1, $2)', [customerId, phones[0]]);
      }

      return response.status(201).json({ message: 'Customer created', customerId });
    }

    if (method === 'PUT' && action === 'customers') {
      const id = request.query.id || request.query.id;
      const { firstName, lastName, gender, street, area, state, dateOfBirth, phones } = request.body;

      await pool.query(
        `UPDATE customer SET firstname = $1, lastname = $2, gender = $3, street = $4, area = $5, state = $6, dateofbirth = $7
         WHERE customerid = $8`,
        [firstName, lastName, gender, street, area, state, dateOfBirth, id]
      );

      if (phones && phones[0]) {
        await pool.query('DELETE FROM customer_phone WHERE customerid = $1', [id]);
        await pool.query('INSERT INTO customer_phone (customerid, phone) VALUES ($1, $2)', [id, phones[0]]);
      }

      return response.status(200).json({ message: 'Customer updated' });
    }

    if (method === 'DELETE' && action === 'customers') {
      const id = request.query.id || request.query.id;
      await pool.query('DELETE FROM customer WHERE customerid = $1', [id]);
      return response.status(200).json({ message: 'Customer deleted' });
    }

    if (method === 'POST' && action === 'employees') {
      const { firstName, lastName, gender, email, departmentId, password } = request.body;
      
      const existing = await pool.query('SELECT employeeid FROM employee WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return response.status(400).json({ message: 'Email already exists' });
      }

      const result = await pool.query(
        `INSERT INTO employee (firstname, lastname, gender, email, departmentid, password)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING employeeid`,
        [firstName, lastName, gender, email, departmentId || 1, password]
      );

      return response.status(201).json({ message: 'Employee created', employeeId: result.rows[0].employeeid });
    }

    if (method === 'PUT' && action === 'employees') {
      const id = request.query.id || request.query.id;
      const { firstName, lastName, gender, salary, email, departmentId } = request.body;

      await pool.query(
        `UPDATE employee SET firstname = $1, lastname = $2, gender = $3, salary = $4, email = $5, departmentid = $6
         WHERE employeeid = $7`,
        [firstName, lastName, gender, salary, email, departmentId, id]
      );

      return response.status(200).json({ message: 'Employee updated' });
    }

    if (method === 'DELETE' && action === 'employees') {
      const id = request.query.id || request.query.id;
      await pool.query('DELETE FROM employee WHERE employeeid = $1', [id]);
      return response.status(200).json({ message: 'Employee deleted' });
    }

    if (method === 'POST' && action === 'accounts') {
      const { accountNumber, accountType, customerId, branchId } = request.body;
      
      const existing = await pool.query('SELECT accountid FROM bank_account WHERE accountnumber = $1', [accountNumber]);
      if (existing.rows.length > 0) {
        return response.status(400).json({ message: 'Account number already exists' });
      }

      const result = await pool.query(
        `INSERT INTO bank_account (accountnumber, accounttype, customerid, branchid, opendate)
         VALUES ($1, $2, $3, $4, CURRENT_DATE) RETURNING accountid`,
        [accountNumber, accountType, customerId, branchId]
      );

      const accountId = result.rows[0].accountid;

      if (accountType === 'Savings') {
        await pool.query('INSERT INTO savings_account (accountid, interestrate) VALUES ($1, 5.0)', [accountId]);
      } else if (accountType === 'Checking') {
        await pool.query('INSERT INTO checking_account (accountid, overdraftlimit) VALUES ($1, 1000)', [accountId]);
      }

      return response.status(201).json({ message: 'Account created', accountId });
    }

    if (method === 'DELETE' && action === 'accounts') {
      const id = request.query.id || request.query.id;
      await pool.query('DELETE FROM bank_account WHERE accountid = $1', [id]);
      return response.status(200).json({ message: 'Account deleted' });
    }

    return response.status(400).json({ message: 'Invalid action or method' });
  } catch (error) {
    console.error('Users API error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}