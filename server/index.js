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
  const [transactions] = await pool.query(
    'SELECT SUM(CASE WHEN TransactionType = "Deposit" THEN Amount ELSE -Amount END) as balance FROM transaction WHERE AccountID = ?',
    [accountId]
  );
  return parseFloat(transactions[0].balance || 0);
};

const getAccountType = async (accountId) => {
  const [savings] = await pool.query('SELECT * FROM savings_account WHERE AccountID = ?', [accountId]);
  if (savings.length > 0) return { type: 'Savings', ...savings[0] };
  const [checking] = await pool.query('SELECT * FROM checking_account WHERE AccountID = ?', [accountId]);
  if (checking.length > 0) return { type: 'Checking', ...checking[0] };
  return null;
};

const getEmployeeRole = async (employeeId) => {
  const [manager] = await pool.query('SELECT * FROM manager_details WHERE EmployeeID = ?', [employeeId]);
  if (manager.length > 0) return { roleType: 'Manager', ...manager[0] };
  const [teller] = await pool.query('SELECT * FROM teller_details WHERE EmployeeID = ?', [employeeId]);
  if (teller.length > 0) return { roleType: 'Teller', ...teller[0] };
  const [clerk] = await pool.query('SELECT * FROM clerk_details WHERE EmployeeID = ?', [employeeId]);
  if (clerk.length > 0) return { roleType: 'Clerk', ...clerk[0] };
  return { roleType: 'Employee' };
};

app.post('/api/login/customer', async (req, res) => {
  try {
    const { nationalId, password } = req.body;
    
    if (!nationalId || !password) {
      return res.status(400).json({ error: 'National ID and password required' });
    }
    
    const [customers] = await pool.query(
      'SELECT * FROM customer WHERE NationalID = ?',
      [nationalId]
    );
    
    if (customers.length === 0) {
      return res.status(401).json({ error: 'Invalid National ID' });
    }
    
    const customer = customers[0];
    
    let passwordValid = false;
    if (customer.Password) {
      passwordValid = await bcrypt.compare(password, customer.Password);
    } else {
      passwordValid = password === '0000';
    }
    
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const token = jwt.sign(
      { id: customer.CustomerID, type: 'customer', nationalId: customer.NationalID },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    const [phones] = await pool.query(
      'SELECT Phone FROM customer_phone WHERE CustomerID = ?',
      [customer.CustomerID]
    );
    
    res.json({
      token,
      user: {
        id: customer.CustomerID,
        type: 'customer',
        name: `${customer.FirstName} ${customer.LastName}`,
        nationalId: customer.NationalID,
        firstName: customer.FirstName,
        lastName: customer.LastName,
        gender: customer.Gender,
        street: customer.Street,
        area: customer.Area,
        state: customer.State,
        dateOfBirth: customer.DateOfBirth,
        phones: phones.map(p => p.Phone),
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
    
    const [employees] = await pool.query(
      'SELECT * FROM employee WHERE EmployeeID = ?',
      [employeeId]
    );
    
    if (employees.length === 0) {
      return res.status(401).json({ error: 'Invalid Employee ID' });
    }
    
    const employee = employees[0];
    
    let passwordValid = false;
    if (employee.Password) {
      passwordValid = await bcrypt.compare(password, employee.Password);
    } else {
      passwordValid = password === '0000';
    }
    
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const [departments] = await pool.query(
      'SELECT * FROM department WHERE DepartmentID = ?',
      [employee.DepartmentID]
    );
    const department = departments[0];
    
    const [branches] = department ? await pool.query(
      'SELECT * FROM branch WHERE BranchID = ?',
      [department.BranchID]
    ) : [[]];
    const branch = branches[0];
    
    const role = await getEmployeeRole(employee.EmployeeID);
    
    const token = jwt.sign(
      { id: employee.EmployeeID, type: 'employee' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/customer/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'customer') {
      return res.status(403).json({ error: 'Customer access required' });
    }
    
    const [customers] = await pool.query(
      'SELECT * FROM customer WHERE CustomerID = ?',
      [req.user.id]
    );
    
    if (customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const customer = customers[0];
    const [phones] = await pool.query(
      'SELECT Phone FROM customer_phone WHERE CustomerID = ?',
      [customer.CustomerID]
    );
    
    res.json({
      ...customer,
      phones: phones.map(p => p.Phone)
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
    
    const [accounts] = await pool.query(
      `SELECT ba.*, 
              COALESCE(sa.InterestRate, ca.OverdraftLimit) as additional_info,
              CASE WHEN sa.AccountID IS NOT NULL THEN 'Savings' ELSE 'Checking' END as AccountTypeName
       FROM bank_account ba
       LEFT JOIN savings_account sa ON ba.AccountID = sa.AccountID
       LEFT JOIN checking_account ca ON ba.AccountID = ca.AccountID
       WHERE ba.CustomerID = ?`,
      [req.user.id]
    );
    
    const accountsWithBalance = await Promise.all(accounts.map(async (account) => {
      const balance = await calculateBalance(account.AccountID);
      const branch = await pool.query('SELECT * FROM branch WHERE BranchID = ?', [account.BranchID]);
      return {
        ...account,
        balance,
        branchName: branch[0]?.[0]?.BranchName,
        branchLocation: branch[0]?.[0]?.Location,
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
    
    const [accounts] = await pool.query(
      'SELECT * FROM bank_account WHERE AccountID = ? AND CustomerID = ?',
      [accountId, req.user.id]
    );
    
    if (accounts.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    const [transactions] = await pool.query(
      'SELECT * FROM transaction WHERE AccountID = ? ORDER BY Date_Time DESC',
      [accountId]
    );
    
    res.json(transactions);
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
    
    const [accounts] = await pool.query(
      'SELECT * FROM bank_account WHERE AccountID = ? AND CustomerID = ?',
      [accountId, req.user.id]
    );
    
    if (accounts.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO transaction (Amount, TransactionType, AccountID, ATMID) VALUES (?, "Deposit", ?, ?)',
      [amount, accountId, atmId]
    );
    
    res.json({ 
      success: true, 
      transactionId: result.insertId,
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
    
    const [accounts] = await pool.query(
      'SELECT * FROM bank_account WHERE AccountID = ? AND CustomerID = ?',
      [accountId, req.user.id]
    );
    
    if (accounts.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    const balance = await calculateBalance(accountId);
    const accountDetails = await getAccountType(accountId);
    
    let allowedOverdraft = 0;
    if (accountDetails?.type === 'Checking' && accountDetails.OverdraftLimit) {
      allowedOverdraft = parseFloat(accountDetails.OverdraftLimit);
    }
    
    if (balance + allowedOverdraft < amount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO transaction (Amount, TransactionType, AccountID, ATMID) VALUES (?, "Withdraw", ?, ?)',
      [amount, accountId, atmId]
    );
    
    res.json({ 
      success: true, 
      transactionId: result.insertId,
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
    
    const [fromAccounts] = await pool.query(
      'SELECT * FROM bank_account WHERE AccountID = ? AND CustomerID = ?',
      [fromAccountId, req.user.id]
    );
    
    if (fromAccounts.length === 0) {
      return res.status(404).json({ error: 'Source account not found' });
    }
    
    const [toAccounts] = await pool.query(
      'SELECT * FROM bank_account WHERE AccountID = ?',
      [toAccountId]
    );
    
    if (toAccounts.length === 0) {
      return res.status(404).json({ error: 'Destination account not found' });
    }
    
    const balance = await calculateBalance(fromAccountId);
    const accountDetails = await getAccountType(fromAccountId);
    
    let allowedOverdraft = 0;
    if (accountDetails?.type === 'Checking' && accountDetails.OverdraftLimit) {
      allowedOverdraft = parseFloat(accountDetails.OverdraftLimit);
    }
    
    if (balance + allowedOverdraft < amount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      await connection.query(
        'INSERT INTO transaction (Amount, TransactionType, AccountID, RelatedAccountID, ATMID) VALUES (?, "Withdraw", ?, ?, 1)',
        [amount, fromAccountId, toAccountId]
      );
      
      await connection.query(
        'INSERT INTO transaction (Amount, TransactionType, AccountID, RelatedAccountID, ATMID) VALUES (?, "Deposit", ?, ?, 1)',
        [amount, toAccountId, fromAccountId]
      );
      
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
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
    
    const [loans] = await pool.query(
      'SELECT * FROM loan_application WHERE CustomerID = ? ORDER BY AppDate DESC',
      [req.user.id]
    );
    
    res.json(loans);
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
    
    const [result] = await pool.query(
      'INSERT INTO loan_application (AppDate, CustomerID) VALUES (NOW(), ?)',
      [req.user.id]
    );
    
    res.json({ 
      success: true, 
      applicationId: result.insertId,
      message: 'Loan application submitted' 
    });
  } catch (error) {
    console.error('Create loan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/customers', authenticateToken, isEmployee, async (req, res) => {
  try {
    const [customers] = await pool.query('SELECT * FROM customer');
    
    const customersWithPhones = await Promise.all(customers.map(async (customer) => {
      const [phones] = await pool.query(
        'SELECT Phone FROM customer_phone WHERE CustomerID = ?',
        [customer.CustomerID]
      );
      return { ...customer, phones: phones.map(p => p.Phone) };
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
    
    const [result] = await pool.query(
      `INSERT INTO customer (NationalID, FirstName, LastName, Gender, Street, Area, State, DateOfBirth, Password) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nationalId, firstName, lastName, gender, street, area, state, dateOfBirth, hashedPassword]
    );
    
    const customerId = result.insertId;
    
    if (phones && phones.length > 0) {
      for (const phone of phones) {
        await pool.query(
          'INSERT INTO customer_phone (CustomerID, Phone) VALUES (?, ?)',
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
    if (error.code === 'ER_DUP_ENTRY') {
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
      `UPDATE customer SET NationalID = ?, FirstName = ?, LastName = ?, Gender = ?, Street = ?, Area = ?, State = ?, DateOfBirth = ? WHERE CustomerID = ?`,
      [nationalId, firstName, lastName, gender, street, area, state, dateOfBirth, id]
    );
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('UPDATE customer SET Password = ? WHERE CustomerID = ?', [hashedPassword, id]);
    }
    
    if (phones) {
      await pool.query('DELETE FROM customer_phone WHERE CustomerID = ?', [id]);
      for (const phone of phones) {
        await pool.query(
          'INSERT INTO customer_phone (CustomerID, Phone) VALUES (?, ?)',
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
    
    await pool.query('DELETE FROM customer_phone WHERE CustomerID = ?', [id]);
    await pool.query('DELETE FROM loan_application WHERE CustomerID = ?', [id]);
    await pool.query('DELETE FROM bank_account WHERE CustomerID = ?', [id]);
    await pool.query('DELETE FROM customer WHERE CustomerID = ?', [id]);
    
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/accounts', authenticateToken, isEmployee, async (req, res) => {
  try {
    const [accounts] = await pool.query(
      `SELECT ba.*, 
              CASE WHEN sa.AccountID IS NOT NULL THEN 'Savings' ELSE 'Checking' END as AccountTypeName
       FROM bank_account ba
       LEFT JOIN savings_account sa ON ba.AccountID = sa.AccountID`
    );
    
    const accountsWithBalance = await Promise.all(accounts.map(async (account) => {
      const balance = await calculateBalance(account.AccountID);
      const customer = await pool.query('SELECT * FROM customer WHERE CustomerID = ?', [account.CustomerID]);
      const branch = await pool.query('SELECT * FROM branch WHERE BranchID = ?', [account.BranchID]);
      return {
        ...account,
        balance,
        customerName: customer[0]?.[0] ? `${customer[0][0].FirstName} ${customer[0][0].LastName}` : null,
        branchName: branch[0]?.[0]?.BranchName,
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
    
    const [result] = await pool.query(
      'INSERT INTO bank_account (AccountNumber, OpenDate, AccountType, CustomerID, BranchID) VALUES (?, NOW(), ?, ?, ?)',
      [accountNumber, accountType, customerId, branchId]
    );
    
    const accountId = result.insertId;
    
    if (accountType === 'Savings') {
      await pool.query(
        'INSERT INTO savings_account (AccountID, InterestRate) VALUES (?, ?)',
        [accountId, interestRate || 5.0]
      );
    } else {
      await pool.query(
        'INSERT INTO checking_account (AccountID, OverdraftLimit) VALUES (?, ?)',
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
    
    await pool.query('DELETE FROM transaction WHERE AccountID = ?', [id]);
    await pool.query('DELETE FROM savings_account WHERE AccountID = ?', [id]);
    await pool.query('DELETE FROM checking_account WHERE AccountID = ?', [id]);
    await pool.query('DELETE FROM bank_account WHERE AccountID = ?', [id]);
    
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/employees', authenticateToken, isEmployee, async (req, res) => {
  try {
    const [employees] = await pool.query('SELECT * FROM employee');
    
    const employeesWithRole = await Promise.all(employees.map(async (employee) => {
      const role = await getEmployeeRole(employee.EmployeeID);
      const department = await pool.query('SELECT * FROM department WHERE DepartmentID = ?', [employee.DepartmentID]);
      return {
        ...employee,
        ...role,
        departmentName: department[0]?.[0]?.DepartmentName,
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
    
    const [result] = await pool.query(
      'INSERT INTO employee (FirstName, LastName, Gender, Salary, Email, Password, DepartmentID) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, gender, salary, email, hashedPassword, departmentId]
    );
    
    const employeeId = result.insertId;
    
    if (roleType === 'Manager') {
      await pool.query(
        'INSERT INTO manager_details (EmployeeID, JobTitle) VALUES (?, ?)',
        [employeeId, jobTitle || 'Manager']
      );
    } else if (roleType === 'Teller') {
      await pool.query(
        'INSERT INTO teller_details (EmployeeID, BranchLocation, TellerID) VALUES (?, ?, ?)',
        [employeeId, branchLocation, tellerId]
      );
    } else if (roleType === 'Clerk') {
      await pool.query(
        'INSERT INTO clerk_details (EmployeeID, ClerkLevel) VALUES (?, ?)',
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
      'UPDATE employee SET FirstName = ?, LastName = ?, Gender = ?, Salary = ?, Email = ?, DepartmentID = ? WHERE EmployeeID = ?',
      [firstName, lastName, gender, salary, email, departmentId, id]
    );
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('UPDATE employee SET Password = ? WHERE EmployeeID = ?', [hashedPassword, id]);
    }
    
    await pool.query('DELETE FROM manager_details WHERE EmployeeID = ?', [id]);
    await pool.query('DELETE FROM teller_details WHERE EmployeeID = ?', [id]);
    await pool.query('DELETE FROM clerk_details WHERE EmployeeID = ?', [id]);
    
    if (roleType === 'Manager') {
      await pool.query(
        'INSERT INTO manager_details (EmployeeID, JobTitle) VALUES (?, ?)',
        [id, jobTitle || 'Manager']
      );
    } else if (roleType === 'Teller') {
      await pool.query(
        'INSERT INTO teller_details (EmployeeID, BranchLocation, TellerID) VALUES (?, ?, ?)',
        [id, branchLocation, tellerId]
      );
    } else if (roleType === 'Clerk') {
      await pool.query(
        'INSERT INTO clerk_details (EmployeeID, ClerkLevel) VALUES (?, ?)',
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
    
    await pool.query('DELETE FROM manager_details WHERE EmployeeID = ?', [id]);
    await pool.query('DELETE FROM teller_details WHERE EmployeeID = ?', [id]);
    await pool.query('DELETE FROM clerk_details WHERE EmployeeID = ?', [id]);
    await pool.query('DELETE FROM employee WHERE EmployeeID = ?', [id]);
    
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/branches', authenticateToken, isEmployee, async (req, res) => {
  try {
    const [branches] = await pool.query('SELECT * FROM branch');
    res.json(branches);
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
    
    const [result] = await pool.query(
      'INSERT INTO branch (BranchName, Location, Email, EstablishedYear) VALUES (?, ?, ?, ?)',
      [branchName, location, email, establishedYear]
    );
    
    res.json({ 
      success: true, 
      branchId: result.insertId,
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
      'UPDATE branch SET BranchName = ?, Location = ?, Email = ?, EstablishedYear = ? WHERE BranchID = ?',
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
    
    await pool.query('DELETE FROM branch WHERE BranchID = ?', [id]);
    res.json({ success: true, message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/departments', authenticateToken, isEmployee, async (req, res) => {
  try {
    const [departments] = await pool.query('SELECT * FROM department');
    
    const departmentsWithBranch = await Promise.all(departments.map(async (dept) => {
      const branch = await pool.query('SELECT * FROM branch WHERE BranchID = ?', [dept.BranchID]);
      return {
        ...dept,
        branchName: branch[0]?.[0]?.BranchName,
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
    
    const [result] = await pool.query(
      'INSERT INTO department (DepartmentName, BranchID) VALUES (?, ?)',
      [departmentName, branchId]
    );
    
    res.json({ 
      success: true, 
      departmentId: result.insertId,
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
      'UPDATE department SET DepartmentName = ?, BranchID = ? WHERE DepartmentID = ?',
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
    
    await pool.query('DELETE FROM department WHERE DepartmentID = ?', [id]);
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/atms', authenticateToken, isEmployee, async (req, res) => {
  try {
    const [atms] = await pool.query('SELECT * FROM atm');
    
    const atmsWithBranch = await Promise.all(atms.map(async (atm) => {
      const branch = await pool.query('SELECT * FROM branch WHERE BranchID = ?', [atm.BranchID]);
      return {
        ...atm,
        branchName: branch[0]?.[0]?.BranchName,
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
    
    const [result] = await pool.query(
      'INSERT INTO atm (Location, InstallDate, Status, BranchID) VALUES (?, NOW(), ?, ?)',
      [location, status || 'Active', branchId]
    );
    
    res.json({ 
      success: true, 
      atmId: result.insertId,
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
      'UPDATE atm SET Location = ?, BranchID = ?, Status = ? WHERE ATMID = ?',
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
    
    await pool.query('DELETE FROM atm WHERE ATMID = ?', [id]);
    res.json({ success: true, message: 'ATM deleted successfully' });
  } catch (error) {
    console.error('Delete ATM error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/transactions', authenticateToken, isEmployee, async (req, res) => {
  try {
    const [transactions] = await pool.query(
      'SELECT t.*, ba.AccountNumber, a.Location as ATMLocation FROM transaction t LEFT JOIN bank_account ba ON t.AccountID = ba.AccountID LEFT JOIN atm a ON t.ATMID = a.ATMID ORDER BY t.Date_Time DESC'
    );
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/loans', authenticateToken, isEmployee, async (req, res) => {
  try {
    const [loans] = await pool.query(
      'SELECT la.*, c.FirstName, c.LastName FROM loan_application la LEFT JOIN customer c ON la.CustomerID = c.CustomerID ORDER BY la.AppDate DESC'
    );
    res.json(loans);
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/loans/:id', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedAmt, startDate, endDate } = req.body;
    
    await pool.query(
      'UPDATE loan_application SET Status = ?, ApprovedAmt = ?, StartDate = ?, EndDate = ? WHERE ApplicationID = ?',
      [status, approvedAmt, startDate, endDate, id]
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