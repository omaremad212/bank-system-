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
      'SELECT COALESCE(SUM(CASE WHEN transactiontype = $1 THEN amount ELSE -amount END), 0) as balance FROM transactions WHERE accountid = $2',
      ['Deposit', accountId]
    );
    return parseFloat(result.rows[0]?.balance || 0);
  } catch (e) {
    return 0;
  }
};

const isManager = (user) => {
  return user.id === 1;
};

const getEmployeeRole = async (employeeId) => {
  try {
    const manager = await pool.query('SELECT 1 FROM manager_details WHERE employeeid = $1 LIMIT 1', [employeeId]);
    if (manager.rows.length > 0) return { roleType: 'Manager' };
    const teller = await pool.query('SELECT 1 FROM teller_details WHERE employeeid = $1 LIMIT 1', [employeeId]);
    if (teller.rows.length > 0) return { roleType: 'Teller' };
    const clerk = await pool.query('SELECT 1 FROM clerk_details WHERE employeeid = $1 LIMIT 1', [employeeId]);
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

  const action = request.query.action;
  const method = request.method;

  const isWrite = method === 'POST' || method === 'PUT' || method === 'DELETE';
  
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
            customerid: customer.customerid,
            nationalid: customer.nationalid,
            firstname: customer.firstname,
            lastname: customer.lastname,
            gender: customer.gender,
            street: customer.street,
            area: customer.area,
            state: customer.state,
            dateofbirth: customer.dateofbirth,
            phones: phonesResult.rows.map(p => p.phone),
          };
        }));
        return response.status(200).json(customersWithPhones);
      }

      if (action === 'employees') {
        const result = await pool.query('SELECT employeeid, firstname, lastname, gender, salary, email, departmentid FROM employee');
        const employeesWithRole = await Promise.all(result.rows.map(async (employee) => {
          const role = await getEmployeeRole(employee.employeeid);
          let departmentname = null;
          try {
            const dept = await pool.query('SELECT departmentname FROM department WHERE departmentid = $1', [employee.departmentid]);
            departmentname = dept.rows[0]?.departmentname;
          } catch {}
          return {
            employeeid: employee.employeeid,
            firstname: employee.firstname,
            lastname: employee.lastname,
            gender: employee.gender,
            salary: employee.salary,
            email: employee.email,
            departmentid: employee.departmentid,
            ...role,
            departmentname,
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
          let customername = null, branchname = null;
          try {
            const customerResult = await pool.query('SELECT firstname, lastname FROM customer WHERE customerid = $1', [account.customerid]);
            customername = customerResult.rows[0] ? `${customerResult.rows[0].firstname} ${customerResult.rows[0].lastname}` : null;
          } catch {}
          try {
            const branchResult = await pool.query('SELECT branchname FROM branch WHERE branchid = $1', [account.branchid]);
            branchname = branchResult.rows[0]?.branchname;
          } catch {}
          return {
            accountid: account.accountid,
            accountnumber: account.accountnumber,
            accounttype: account.accounttype,
            opendate: account.opendate,
            customerid: account.customerid,
            branchid: account.branchid,
            balance,
            customername,
            branchname,
          };
        }));
        return response.status(200).json(accountsWithBalance);
      }
    }

    if (method === 'POST' && action === 'customers') {
      const { nationalId, firstName, lastName, gender, dateOfBirth, street, area, state, phone } = request.body;
      
      if (!nationalId || !firstName || !lastName) {
        return response.status(400).json({ message: 'First name, last name, and National ID are required' });
      }
      
      if (!gender) {
        return response.status(400).json({ message: 'Gender is required' });
      }
      
      const existing = await pool.query('SELECT customerid FROM customer WHERE nationalid = $1', [nationalId]);
      if (existing.rows.length > 0) {
        return response.status(400).json({ message: 'National ID already exists' });
      }

      const result = await pool.query(
        `INSERT INTO customer (nationalid, firstname, lastname, gender, dateofbirth, street, area, state)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING customerid`,
        [nationalId, firstName, lastName, gender, dateOfBirth || null, street || null, area || null, state || null]
      );

      const customerId = result.rows[0].customerid;
      
      if (phone) {
        await pool.query('INSERT INTO customer_phone (customerid, phone) VALUES ($1, $2)', [customerId, phone]);
      }

      return response.status(201).json({ message: 'Customer created', customerId });
    }

    if (method === 'PUT' && action === 'customers') {
      const id = request.query.id;
      const { firstName, lastName, gender, dateOfBirth, street, area, state, phone } = request.body;

      await pool.query(
        `UPDATE customer SET firstname = $1, lastname = $2, gender = $3, dateofbirth = $4, street = $5, area = $6, state = $7
         WHERE customerid = $8`,
        [firstName, lastName, gender, dateOfBirth || null, street || null, area || null, state || null, id]
      );

      if (phone) {
        await pool.query('DELETE FROM customer_phone WHERE customerid = $1', [id]);
        await pool.query('INSERT INTO customer_phone (customerid, phone) VALUES ($1, $2)', [id, phone]);
      }

      return response.status(200).json({ message: 'Customer updated' });
    }

    if (method === 'DELETE' && action === 'customers') {
      const id = request.query.id;
      if (!id) {
        return response.status(400).json({ message: 'Customer ID is required' });
      }
      const customerId = parseInt(id);
      if (isNaN(customerId)) {
        return response.status(400).json({ message: 'Invalid customer ID' });
      }
      
      await pool.query('DELETE FROM customer_phone WHERE customerid = $1', [customerId]);
      
      const accounts = await pool.query('SELECT accountid FROM bank_account WHERE customerid = $1', [customerId]);
      for (const acc of accounts.rows) {
        await pool.query('DELETE FROM savings_account WHERE accountid = $1', [acc.accountid]).catch(() => {});
        await pool.query('DELETE FROM checking_account WHERE accountid = $1', [acc.accountid]).catch(() => {});
      }
      await pool.query('DELETE FROM bank_account WHERE customerid = $1', [customerId]).catch(() => {});
      await pool.query('DELETE FROM loan_application WHERE customerid = $1', [customerId]).catch(() => {});
      await pool.query('DELETE FROM customer WHERE customerid = $1', [customerId]);
      return response.status(200).json({ message: 'Customer deleted', customerId });
    }

    if (method === 'POST' && action === 'employees') {
      const { firstName, lastName, gender, email, password, salary, roleType } = request.body;
      
      if (!firstName || !lastName || !email || !password) {
        return response.status(400).json({ message: 'First name, last name, email and password are required' });
      }
      
      const existing = await pool.query('SELECT employeeid FROM employee WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return response.status(400).json({ message: 'Email already exists' });
      }

      const result = await pool.query(
        `INSERT INTO employee (firstname, lastname, gender, email, salary, password)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING employeeid`,
        [firstName, lastName, gender || 'Male', email, salary || 5000, password]
      );

      const employeeId = result.rows[0].employeeid;
      
      if (roleType === 'Manager') {
        await pool.query('INSERT INTO manager_details (employeeid) VALUES ($1)', [employeeId]).catch(() => {});
      } else if (roleType === 'Teller') {
        await pool.query('INSERT INTO teller_details (employeeid) VALUES ($1)', [employeeId]).catch(() => {});
      } else if (roleType === 'Clerk') {
        await pool.query('INSERT INTO clerk_details (employeeid) VALUES ($1)', [employeeId]).catch(() => {});
      }

      return response.status(201).json({ message: 'Employee created', employeeId });
    }

    if (method === 'PUT' && action === 'employees') {
      const id = request.query.id;
      const { firstName, lastName, gender, salary, email, departmentId } = request.body;

      await pool.query(
        `UPDATE employee SET firstname = $1, lastname = $2, gender = $3, salary = $4, email = $5, departmentid = $6
         WHERE employeeid = $7`,
        [firstName, lastName, gender, salary, email, departmentId, id]
      );

      return response.status(200).json({ message: 'Employee updated' });
    }

    if (method === 'DELETE' && action === 'employees') {
      const id = request.query.id;
      if (!id) {
        return response.status(400).json({ message: 'Employee ID is required' });
      }
      const employeeId = parseInt(id);
      if (isNaN(employeeId)) {
        return response.status(400).json({ message: 'Invalid employee ID' });
      }
      
      await pool.query('DELETE FROM manager_details WHERE employeeid = $1', [employeeId]).catch(() => {});
      await pool.query('DELETE FROM teller_details WHERE employeeid = $1', [employeeId]).catch(() => {});
      await pool.query('DELETE FROM clerk_details WHERE employeeid = $1', [employeeId]).catch(() => {});
      await pool.query('DELETE FROM employee WHERE employeeid = $1', [employeeId]);
      return response.status(200).json({ message: 'Employee deleted', employeeId });
    }

    if (method === 'POST' && action === 'accounts') {
      const { accountType, customerId, branchId, initialBalance } = request.body;
      
      if (!accountType || !customerId) {
        return response.status(400).json({ message: 'Account type and customer are required' });
      }

      const lastAccount = await pool.query('SELECT accountnumber FROM bank_account ORDER BY accountid DESC LIMIT 1');
      let nextNumber = 1001;
      if (lastAccount.rows.length > 0) {
        const lastNum = parseInt(lastAccount.rows[0].accountnumber.replace('ACC-', ''));
        nextNumber = lastNum + 1;
      }
      const accountNumber = `ACC-${nextNumber}`;

      const result = await pool.query(
        `INSERT INTO bank_account (accountnumber, accounttype, customerid, branchid, opendate)
         VALUES ($1, $2, $3, $4, CURRENT_DATE) RETURNING accountid`,
        [accountNumber, accountType, customerId, branchId || 1]
      );

      const accountId = result.rows[0].accountid;

      if (accountType === 'Savings') {
        await pool.query('INSERT INTO savings_account (accountid, interestrate) VALUES ($1, 5.0)', [accountId]);
      } else if (accountType === 'Checking') {
        await pool.query('INSERT INTO checking_account (accountid, overdraftlimit) VALUES ($1, 1000)', [accountId]);
      }

      if (initialBalance && initialBalance > 0) {
        await pool.query(
          `INSERT INTO transactions (amount, transactiontype, accountid, date_time)
           VALUES ($1, 'Deposit', $2, CURRENT_TIMESTAMP)`,
          [initialBalance, accountId]
        );
      }

      return response.status(201).json({ message: 'Account created', accountId, accountNumber });
    }

    if (method === 'DELETE' && action === 'accounts') {
      const id = request.query.id;
      if (!id) {
        return response.status(400).json({ message: 'Account ID is required' });
      }
      const accountId = parseInt(id);
      if (isNaN(accountId)) {
        return response.status(400).json({ message: 'Invalid account ID' });
      }
      
      await pool.query('DELETE FROM transactions WHERE accountid = $1', [accountId]).catch(() => {});
      await pool.query('DELETE FROM savings_account WHERE accountid = $1', [accountId]).catch(() => {});
      await pool.query('DELETE FROM checking_account WHERE accountid = $1', [accountId]).catch(() => {});
      await pool.query('DELETE FROM bank_account WHERE accountid = $1', [accountId]);
      return response.status(200).json({ message: 'Account deleted', accountId });
    }

    return response.status(400).json({ message: 'Invalid action or method' });
  } catch (error) {
    console.error('Users API error:', error);
    return response.status(500).json({ message: 'Internal server error: ' + error.message });
  }
}