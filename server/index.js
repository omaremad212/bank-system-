import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const isEmployee = (req, res, next) => {
  if (req.user.type !== 'employee') {
    return res.status(403).json({ error: 'Employee access required' });
  }
  next();
};

const calculateBalance = async (accountId) => {
  const result = await pool.query(
    'SELECT COALESCE(SUM(CASE WHEN TransactionType = \'Deposit\' THEN Amount ELSE -Amount END), 0) as balance FROM transaction WHERE AccountID = $1',
    [accountId]
  );
  return parseFloat(result.rows[0]?.balance || 0);
};

const getAccountType = async (accountId) => {
  const savings = await pool.query('SELECT * FROM savings_account WHERE AccountID = $1', [accountId]);
  if (savings.rows.length > 0) return { type: 'Savings', ...savings.rows[0] };
  const checking = await pool.query('SELECT * FROM checking_account WHERE AccountID = $1', [accountId]);
  if (checking.rows.length > 0) return { type: 'Checking', ...checking.rows[0] };
  return null;
};

const getEmployeeRole = async (employeeId) => {
  const manager = await pool.query('SELECT * FROM manager_details WHERE EmployeeID = $1', [employeeId]);
  if (manager.rows.length > 0) return { roleType: 'Manager', ...manager.rows[0] };
  const teller = await pool.query('SELECT * FROM teller_details WHERE EmployeeID = $1', [employeeId]);
  if (teller.rows.length > 0) return { roleType: 'Teller', ...teller.rows[0] };
  const clerk = await pool.query('SELECT * FROM clerk_details WHERE EmployeeID = $1', [employeeId]);
  if (clerk.rows.length > 0) return { roleType: 'Clerk', ...clerk.rows[0] };
  return { roleType: 'Employee' };
};

app.post('/api/login/customer', async (req, res) => {
  try {
    const { nationalId, password } = req.body;
    
    if (!nationalId || !password) {
      return res.status(400).json({ error: 'National ID and password required' });
    }
    
    const result = await pool.query(
      'SELECT * FROM customer WHERE NationalID = $1',
      [nationalId]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid National ID' });
    }
    
    const customer = result.rows[0];
    
    let passwordValid = false;
    if (customer.password) {
      passwordValid = await bcrypt.compare(password, customer.password);
    } else {
      passwordValid = password === '0000';
    }
    
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const token = jwt.sign(
      { id: customer.customerid, type: 'customer', nationalId: customer.nationalid },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    const phonesResult = await pool.query(
      'SELECT Phone FROM customer_phone WHERE CustomerID = $1',
      [customer.customerid]
    );
    
    res.json({
      token,
      user: {
        id: customer.customerid,
        type: 'customer',
        name: `${customer.firstname} ${customer.lastname}`,
        nationalId: customer.nationalid,
        firstName: customer.firstname,
        lastName: customer.lastname,
        gender: customer.gender,
        street: customer.street,
        area: customer.area,
        state: customer.state,
        dateOfBirth: customer.dateofbirth,
        phones: phonesResult.rows.map(p => p.phone),
      }
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login/employee', async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    
    if (!employeeId || !password) {
      return res.status(400).json({ error: 'Employee ID and password required' });
    }
    
    const result = await pool.query(
      'SELECT * FROM employee WHERE EmployeeID = $1',
      [employeeId]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid Employee ID' });
    }
    
    const employee = result.rows[0];
    
    let passwordValid = false;
    if (employee.password) {
      passwordValid = await bcrypt.compare(password, employee.password);
    } else {
      passwordValid = password === '0000';
    }
    
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const departmentsResult = await pool.query(
      'SELECT * FROM department WHERE DepartmentID = $1',
      [employee.departmentid]
    );
    const department = departmentsResult.rows[0];
    
    const branchesResult = department ? await pool.query(
      'SELECT * FROM branch WHERE BranchID = $1',
      [department.branchid]
    ) : { rows: [] };
    const branch = branchesResult.rows[0];
    
    const role = await getEmployeeRole(employee.employeeid);
    
    const token = jwt.sign(
      { id: employee.employeeid, type: 'employee' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/customer/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'customer') {
      return res.status(403).json({ error: 'Customer access required' });
    }
    
    const result = await pool.query(
      'SELECT * FROM customer WHERE CustomerID = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const customer = result.rows[0];
    const phonesResult = await pool.query(
      'SELECT Phone FROM customer_phone WHERE CustomerID = $1',
      [customer.customerid]
    );
    
    res.json({
      ...customer,
      phones: phonesResult.rows.map(p => p.phone)
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/customer/accounts', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'customer') {
      return res.status(403).json({ error: 'Customer access required' });
    }
    
    const result = await pool.query(
      `SELECT ba.*, 
              COALESCE(sa.interestrate, ca.overdraftlimit) as additional_info,
              CASE WHEN sa.accountid IS NOT NULL THEN 'Savings' ELSE 'Checking' END as accounttypename
       FROM bank_account ba
       LEFT JOIN savings_account sa ON ba.accountid = sa.accountid
       LEFT JOIN checking_account ca ON ba.accountid = ca.accountid
       WHERE ba.customerid = $1`,
      [req.user.id]
    );
    
    const accountsWithBalance = await Promise.all(result.rows.map(async (account) => {
      const balance = await calculateBalance(account.accountid);
      const branchResult = await pool.query('SELECT * FROM branch WHERE BranchID = $1', [account.branchid]);
      return {
        ...account,
        balance,
        branchName: branchResult.rows[0]?.branchname,
        branchLocation: branchResult.rows[0]?.location,
      };
    }));
    
    res.json(accountsWithBalance);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/customer/accounts/:accountId/transactions', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'customer') {
      return res.status(403).json({ error: 'Customer access required' });
    }
    
    const { accountId } = req.params;
    
    const accountsResult = await pool.query(
      'SELECT * FROM bank_account WHERE AccountID = $1 AND CustomerID = $2',
      [accountId, req.user.id]
    );
    
    if (accountsResult.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    const transactionsResult = await pool.query(
      'SELECT * FROM transaction WHERE AccountID = $1 ORDER BY date_time DESC',
      [accountId]
    );
    
    res.json(transactionsResult.rows);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/customer/deposit', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'customer') {
      return res.status(403).json({ error: 'Customer access required' });
    }
    
    const { accountId, amount, atmId = 1 } = req.body;
    
    if (!accountId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid account or amount' });
    }
    
    const accountsResult = await pool.query(
      'SELECT * FROM bank_account WHERE AccountID = $1 AND CustomerID = $2',
      [accountId, req.user.id]
    );
    
    if (accountsResult.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    const result = await pool.query(
      'INSERT INTO transaction (amount, transactiontype, accountid, atmid) VALUES ($1, \'Deposit\', $2, $3) RETURNING transactionid',
      [amount, accountId, atmId]
    );
    
    res.json({ 
      success: true, 
      transactionId: result.rows[0].transactionid,
      message: 'Deposit successful' 
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/customer/withdraw', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'customer') {
      return res.status(403).json({ error: 'Customer access required' });
    }
    
    const { accountId, amount, atmId = 1 } = req.body;
    
    if (!accountId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid account or amount' });
    }
    
    const accountsResult = await pool.query(
      'SELECT * FROM bank_account WHERE AccountID = $1 AND CustomerID = $2',
      [accountId, req.user.id]
    );
    
    if (accountsResult.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    const balance = await calculateBalance(accountId);
    const accountDetails = await getAccountType(accountId);
    
    let allowedOverdraft = 0;
    if (accountDetails?.type === 'Checking' && accountDetails.overdraftlimit) {
      allowedOverdraft = parseFloat(accountDetails.overdraftlimit);
    }
    
    if (balance + allowedOverdraft < amount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    
    const result = await pool.query(
      'INSERT INTO transaction (amount, transactiontype, accountid, atmid) VALUES ($1, \'Withdraw\', $2, $3) RETURNING transactionid',
      [amount, accountId, atmId]
    );
    
    res.json({ 
      success: true, 
      transactionId: result.rows[0].transactionid,
      message: 'Withdrawal successful' 
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/customer/transfer', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'customer') {
      return res.status(403).json({ error: 'Customer access required' });
    }
    
    const { fromAccountId, toAccountId, amount } = req.body;
    
    if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    if (fromAccountId === toAccountId) {
      return res.status(400).json({ error: 'Cannot transfer to same account' });
    }
    
    const fromAccountsResult = await pool.query(
      'SELECT * FROM bank_account WHERE AccountID = $1 AND CustomerID = $2',
      [fromAccountId, req.user.id]
    );
    
    if (fromAccountsResult.rows.length === 0) {
      return res.status(404).json({ error: 'Source account not found' });
    }
    
    const toAccountsResult = await pool.query(
      'SELECT * FROM bank_account WHERE AccountID = $1',
      [toAccountId]
    );
    
    if (toAccountsResult.rows.length === 0) {
      return res.status(404).json({ error: 'Destination account not found' });
    }
    
    const balance = await calculateBalance(fromAccountId);
    const accountDetails = await getAccountType(fromAccountId);
    
    let allowedOverdraft = 0;
    if (accountDetails?.type === 'Checking' && accountDetails.overdraftlimit) {
      allowedOverdraft = parseFloat(accountDetails.overdraftlimit);
    }
    
    if (balance + allowedOverdraft < amount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      await client.query(
        'INSERT INTO transaction (amount, transactiontype, accountid, relatedaccountid, atmid) VALUES ($1, \'Withdraw\', $2, $3, 1)',
        [amount, fromAccountId, toAccountId]
      );
      
      await client.query(
        'INSERT INTO transaction (amount, transactiontype, accountid, relatedaccountid, atmid) VALUES ($1, \'Deposit\', $2, $3, 1)',
        [amount, toAccountId, fromAccountId]
      );
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
    res.json({ 
      success: true, 
      message: 'Transfer successful' 
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/customer/loans', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'customer') {
      return res.status(403).json({ error: 'Customer access required' });
    }
    
    const result = await pool.query(
      'SELECT * FROM loan_application WHERE CustomerID = $1 ORDER BY appdate DESC',
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/customer/loans', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'customer') {
      return res.status(403).json({ error: 'Customer access required' });
    }
    
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const result = await pool.query(
      'INSERT INTO loan_application (appdate, customerid) VALUES (CURRENT_DATE, $1) RETURNING applicationid',
      [req.user.id]
    );
    
    res.json({ 
      success: true, 
      applicationId: result.rows[0].applicationid,
      message: 'Loan application submitted' 
    });
  } catch (error) {
    console.error('Create loan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/customers', authenticateToken, isEmployee, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customer');
    
    const customersWithPhones = await Promise.all(result.rows.map(async (customer) => {
      const phonesResult = await pool.query(
        'SELECT Phone FROM customer_phone WHERE CustomerID = $1',
        [customer.customerid]
      );
      return { ...customer, phones: phonesResult.rows.map(p => p.phone) };
    }));
    
    res.json(customersWithPhones);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/customers', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { nationalId, firstName, lastName, gender, street, area, state, dateOfBirth, phones, password } = req.body;
    
    if (!nationalId || !firstName || !lastName || !gender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const hashedPassword = password ? await bcrypt.hash(password, 10) : await bcrypt.hash('0000', 10);
    
    const result = await pool.query(
      `INSERT INTO customer (nationalid, firstname, lastname, gender, street, area, state, dateofbirth, password) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING customerid`,
      [nationalId, firstName, lastName, gender, street, area, state, dateOfBirth, hashedPassword]
    );
    
    const customerId = result.rows[0].customerid;
    
    if (phones && phones.length > 0) {
      for (const phone of phones) {
        await pool.query(
          'INSERT INTO customer_phone (customerid, phone) VALUES ($1, $2)',
          [customerId, phone]
        );
      }
    }
    
    res.json({ 
      success: true, 
      customerId,
      message: 'Customer created successfully' 
    });
  } catch (error) {
    console.error('Create customer error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'National ID already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/customers/:id', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const { nationalId, firstName, lastName, gender, street, area, state, dateOfBirth, phones, password } = req.body;
    
    await pool.query(
      `UPDATE customer SET nationalid = $1, firstname = $2, lastname = $3, gender = $4, street = $5, area = $6, state = $7, dateofbirth = $8 WHERE customerid = $9`,
      [nationalId, firstName, lastName, gender, street, area, state, dateOfBirth, id]
    );
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('UPDATE customer SET password = $1 WHERE customerid = $2', [hashedPassword, id]);
    }
    
    if (phones) {
      await pool.query('DELETE FROM customer_phone WHERE customerid = $1', [id]);
      for (const phone of phones) {
        await pool.query(
          'INSERT INTO customer_phone (customerid, phone) VALUES ($1, $2)',
          [id, phone]
        );
      }
    }
    
    res.json({ success: true, message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/customers/:id', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM customer_phone WHERE customerid = $1', [id]);
    await pool.query('DELETE FROM loan_application WHERE customerid = $1', [id]);
    await pool.query('DELETE FROM bank_account WHERE customerid = $1', [id]);
    await pool.query('DELETE FROM customer WHERE customerid = $1', [id]);
    
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/accounts', authenticateToken, isEmployee, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ba.*, 
              CASE WHEN sa.accountid IS NOT NULL THEN 'Savings' ELSE 'Checking' END as accounttypename
       FROM bank_account ba
       LEFT JOIN savings_account sa ON ba.accountid = sa.accountid`
    );
    
    const accountsWithBalance = await Promise.all(result.rows.map(async (account) => {
      const balance = await calculateBalance(account.accountid);
      const customerResult = await pool.query('SELECT * FROM customer WHERE customerid = $1', [account.customerid]);
      const branchResult = await pool.query('SELECT * FROM branch WHERE branchid = $1', [account.branchid]);
      return {
        ...account,
        balance,
        customerName: customerResult.rows[0] ? `${customerResult.rows[0].firstname} ${customerResult.rows[0].lastname}` : null,
        branchName: branchResult.rows[0]?.branchname,
      };
    }));
    
    res.json(accountsWithBalance);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/accounts', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { customerId, accountType, branchId, interestRate, overdraftLimit } = req.body;
    
    if (!customerId || !accountType || !branchId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const accountNumber = `ACC-${Date.now()}`;
    
    const result = await pool.query(
      'INSERT INTO bank_account (accountnumber, opendate, accounttype, customerid, branchid) VALUES ($1, CURRENT_DATE, $2, $3, $4) RETURNING accountid',
      [accountNumber, accountType, customerId, branchId]
    );
    
    const accountId = result.rows[0].accountid;
    
    if (accountType === 'Savings') {
      await pool.query(
        'INSERT INTO savings_account (accountid, interestrate) VALUES ($1, $2)',
        [accountId, interestRate || 5.0]
      );
    } else {
      await pool.query(
        'INSERT INTO checking_account (accountid, overdraftlimit) VALUES ($1, $2)',
        [accountId, overdraftLimit || 1000]
      );
    }
    
    res.json({ 
      success: true, 
      accountId,
      message: 'Account created successfully' 
    });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/accounts/:id', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM transaction WHERE accountid = $1', [id]);
    await pool.query('DELETE FROM savings_account WHERE accountid = $1', [id]);
    await pool.query('DELETE FROM checking_account WHERE accountid = $1', [id]);
    await pool.query('DELETE FROM bank_account WHERE accountid = $1', [id]);
    
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/employees', authenticateToken, isEmployee, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employee');
    
    const employeesWithRole = await Promise.all(result.rows.map(async (employee) => {
      const role = await getEmployeeRole(employee.employeeid);
      const departmentResult = await pool.query('SELECT * FROM department WHERE departmentid = $1', [employee.departmentid]);
      return {
        ...employee,
        ...role,
        departmentName: departmentResult.rows[0]?.departmentname,
      };
    }));
    
    res.json(employeesWithRole);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/employees', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { firstName, lastName, gender, salary, email, departmentId, roleType, jobTitle, tellerId, branchLocation, clerkLevel, password } = req.body;
    
    if (!firstName || !lastName || !gender || !departmentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const hashedPassword = password ? await bcrypt.hash(password, 10) : await bcrypt.hash('0000', 10);
    
    const result = await pool.query(
      'INSERT INTO employee (firstname, lastname, gender, salary, email, password, departmentid) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING employeeid',
      [firstName, lastName, gender, salary, email, hashedPassword, departmentId]
    );
    
    const employeeId = result.rows[0].employeeid;
    
    if (roleType === 'Manager') {
      await pool.query(
        'INSERT INTO manager_details (employeeid, jobtitle) VALUES ($1, $2)',
        [employeeId, jobTitle || 'Manager']
      );
    } else if (roleType === 'Teller') {
      await pool.query(
        'INSERT INTO teller_details (employeeid, branchlocation, tellerid) VALUES ($1, $2, $3)',
        [employeeId, branchLocation, tellerId]
      );
    } else if (roleType === 'Clerk') {
      await pool.query(
        'INSERT INTO clerk_details (employeeid, clerklevel) VALUES ($1, $2)',
        [employeeId, clerkLevel || 'Clerk']
      );
    }
    
    res.json({ 
      success: true, 
      employeeId,
      message: 'Employee created successfully' 
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/employees/:id', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, gender, salary, email, departmentId, roleType, jobTitle, tellerId, branchLocation, clerkLevel, password } = req.body;
    
    await pool.query(
      'UPDATE employee SET firstname = $1, lastname = $2, gender = $3, salary = $4, email = $5, departmentid = $6 WHERE employeeid = $7',
      [firstName, lastName, gender, salary, email, departmentId, id]
    );
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('UPDATE employee SET password = $1 WHERE employeeid = $2', [hashedPassword, id]);
    }
    
    await pool.query('DELETE FROM manager_details WHERE employeeid = $1', [id]);
    await pool.query('DELETE FROM teller_details WHERE employeeid = $1', [id]);
    await pool.query('DELETE FROM clerk_details WHERE employeeid = $1', [id]);
    
    if (roleType === 'Manager') {
      await pool.query(
        'INSERT INTO manager_details (employeeid, jobtitle) VALUES ($1, $2)',
        [id, jobTitle || 'Manager']
      );
    } else if (roleType === 'Teller') {
      await pool.query(
        'INSERT INTO teller_details (employeeid, branchlocation, tellerid) VALUES ($1, $2, $3)',
        [id, branchLocation, tellerId]
      );
    } else if (roleType === 'Clerk') {
      await pool.query(
        'INSERT INTO clerk_details (employeeid, clerklevel) VALUES ($1, $2)',
        [id, clerkLevel || 'Clerk']
      );
    }
    
    res.json({ success: true, message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/employees/:id', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM manager_details WHERE employeeid = $1', [id]);
    await pool.query('DELETE FROM teller_details WHERE employeeid = $1', [id]);
    await pool.query('DELETE FROM clerk_details WHERE employeeid = $1', [id]);
    await pool.query('DELETE FROM employee WHERE employeeid = $1', [id]);
    
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/branches', authenticateToken, isEmployee, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branch');
    res.json(result.rows);
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/branches', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { branchName, location, email, establishedYear } = req.body;
    
    if (!branchName) {
      return res.status(400).json({ error: 'Branch name required' });
    }
    
    const result = await pool.query(
      'INSERT INTO branch (branchname, location, email, establishedyear) VALUES ($1, $2, $3, $4) RETURNING branchid',
      [branchName, location, email, establishedYear]
    );
    
    res.json({ 
      success: true, 
      branchId: result.rows[0].branchid,
      message: 'Branch created successfully' 
    });
  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/branches/:id', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const { branchName, location, email, establishedYear } = req.body;
    
    await pool.query(
      'UPDATE branch SET branchname = $1, location = $2, email = $3, establishedyear = $4 WHERE branchid = $5',
      [branchName, location, email, establishedYear, id]
    );
    
    res.json({ success: true, message: 'Branch updated successfully' });
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/branches/:id', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM branch WHERE branchid = $1', [id]);
    res.json({ success: true, message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/departments', authenticateToken, isEmployee, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM department');
    
    const departmentsWithBranch = await Promise.all(result.rows.map(async (dept) => {
      const branchResult = await pool.query('SELECT * FROM branch WHERE branchid = $1', [dept.branchid]);
      return {
        ...dept,
        branchName: branchResult.rows[0]?.branchname,
      };
    }));
    
    res.json(departmentsWithBranch);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/departments', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { departmentName, branchId } = req.body;
    
    if (!departmentName) {
      return res.status(400).json({ error: 'Department name required' });
    }
    
    const result = await pool.query(
      'INSERT INTO department (departmentname, branchid) VALUES ($1, $2) RETURNING departmentid',
      [departmentName, branchId]
    );
    
    res.json({ 
      success: true, 
      departmentId: result.rows[0].departmentid,
      message: 'Department created successfully' 
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/departments/:id', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const { departmentName, branchId } = req.body;
    
    await pool.query(
      'UPDATE department SET departmentname = $1, branchid = $2 WHERE departmentid = $3',
      [departmentName, branchId, id]
    );
    
    res.json({ success: true, message: 'Department updated successfully' });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/departments/:id', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM department WHERE departmentid = $1', [id]);
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/atms', authenticateToken, isEmployee, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM atm');
    
    const atmsWithBranch = await Promise.all(result.rows.map(async (atm) => {
      const branchResult = await pool.query('SELECT * FROM branch WHERE branchid = $1', [atm.branchid]);
      return {
        ...atm,
        branchName: branchResult.rows[0]?.branchname,
      };
    }));
    
    res.json(atmsWithBranch);
  } catch (error) {
    console.error('Get ATMs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/atms', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { location, branchId, status } = req.body;
    
    if (!location) {
      return res.status(400).json({ error: 'Location required' });
    }
    
    const result = await pool.query(
      'INSERT INTO atm (location, installdate, status, branchid) VALUES ($1, CURRENT_DATE, $2, $3) RETURNING atmid',
      [location, status || 'Active', branchId]
    );
    
    res.json({ 
      success: true, 
      atmId: result.rows[0].atmid,
      message: 'ATM created successfully' 
    });
  } catch (error) {
    console.error('Create ATM error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/atms/:id', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const { location, branchId, status } = req.body;
    
    await pool.query(
      'UPDATE atm SET location = $1, branchid = $2, status = $3 WHERE atmid = $4',
      [location, branchId, status, id]
    );
    
    res.json({ success: true, message: 'ATM updated successfully' });
  } catch (error) {
    console.error('Update ATM error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/atms/:id', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM atm WHERE atmid = $1', [id]);
    res.json({ success: true, message: 'ATM deleted successfully' });
  } catch (error) {
    console.error('Delete ATM error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/transactions', authenticateToken, isEmployee, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT t.*, ba.accountnumber, a.location as atmlocation FROM transaction t LEFT JOIN bank_account ba ON t.accountid = ba.accountid LEFT JOIN atm a ON t.atmid = a.atmid ORDER BY t.date_time DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/loans', authenticateToken, isEmployee, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT la.*, c.firstname, c.lastname FROM loan_application la LEFT JOIN customer c ON la.customerid = c.customerid ORDER BY la.appdate DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/loans/:id', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedamt, startdate, enddate } = req.body;
    
    await pool.query(
      'UPDATE loan_application SET status = $1, approvedamt = $2, startdate = $3, enddate = $4 WHERE applicationid = $5',
      [status, approvedamt, startdate, enddate, id]
    );
    
    res.json({ success: true, message: 'Loan updated successfully' });
  } catch (error) {
    console.error('Update loan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;