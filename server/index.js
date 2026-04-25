import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

app.post('/api/login/customer', async (req, res) => {
  try {
    const { nationalId, password } = req.body;
    
    if (!nationalId || !password) {
      return res.status(400).json({ error: 'National ID and password required' });
    }
    
    if (password !== '0000') {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const [customers] = await pool.query(
      'SELECT * FROM customer WHERE NationalID = ?',
      [nationalId]
    );
    
    if (customers.length === 0) {
      return res.status(401).json({ error: 'Invalid National ID' });
    }
    
    const customer = customers[0];
    
    const token = jwt.sign(
      { id: customer.CustomerID, type: 'customer', nationalId: customer.NationalID },
      JWT_SECRET,
      { expiresIn: '24h' }
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
    
    if (password !== '0000') {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const [employees] = await pool.query(
      'SELECT * FROM employee WHERE EmployeeID = ?',
      [employeeId]
    );
    
    if (employees.length === 0) {
      return res.status(401).json({ error: 'Invalid Employee ID' });
    }
    
    const employee = employees[0];
    
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
        departmentId: employee.DepartmentID,
      }
    });
  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/customer/profile', authenticateToken, async (req, res) => {
  try {
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
      const [transactions] = await pool.query(
        'SELECT SUM(CASE WHEN TransactionType = "Deposit" THEN Amount ELSE -Amount END) as balance FROM transaction WHERE AccountID = ?',
        [account.AccountID]
      );
      const balance = transactions[0].balance || 0;
      return {
        ...account,
        balance: parseFloat(balance)
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
    const { accountId } = req.params;
    
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
    const { accountId, amount, atmId = 1 } = req.body;
    
    if (!accountId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid account or amount' });
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
    const { accountId, amount, atmId = 1 } = req.body;
    
    if (!accountId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid account or amount' });
    }
    
    const [transactions] = await pool.query(
      'SELECT SUM(CASE WHEN TransactionType = "Deposit" THEN Amount ELSE -Amount END) as balance FROM transaction WHERE AccountID = ?',
      [accountId]
    );
    const balance = parseFloat(transactions[0].balance || 0);
    
    const [account] = await pool.query(
      'SELECT ca.OverdraftLimit FROM checking_account ca WHERE ca.AccountID = ?',
      [accountId]
    );
    
    let allowedOverdraft = 0;
    if (account.length > 0 && account[0].OverdraftLimit) {
      allowedOverdraft = parseFloat(account[0].OverdraftLimit);
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
    const { fromAccountId, toAccountId, amount } = req.body;
    
    if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    if (fromAccountId === toAccountId) {
      return res.status(400).json({ error: 'Cannot transfer to same account' });
    }
    
    const [transactions] = await pool.query(
      'SELECT SUM(CASE WHEN TransactionType = "Deposit" THEN Amount ELSE -Amount END) as balance FROM transaction WHERE AccountID = ?',
      [fromAccountId]
    );
    const balance = parseFloat(transactions[0].balance || 0);
    
    const [account] = await pool.query(
      'SELECT ca.OverdraftLimit FROM checking_account ca WHERE ca.AccountID = ?',
      [fromAccountId]
    );
    
    let allowedOverdraft = 0;
    if (account.length > 0 && account[0].OverdraftLimit) {
      allowedOverdraft = parseFloat(account[0].OverdraftLimit);
    }
    
    if (balance + allowedOverdraft < amount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      await connection.query(
        'INSERT INTO transaction (Amount, TransactionType, AccountID, ATMID) VALUES (?, "Withdraw", ?, 1)',
        [amount, fromAccountId]
      );
      
      await connection.query(
        'INSERT INTO transaction (Amount, TransactionType, AccountID, ATMID) VALUES (?, "Deposit", ?, 1)',
        [amount, toAccountId]
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
    const [loans] = await pool.query(
      'SELECT * FROM loan_application WHERE CustomerID = ? ORDER BY AppDate DESC',
      [req.user.id]
    );
    
    res.json(loans.map(loan => ({
      ...loan,
      status: loan.ApprovedAmt ? 'Approved' : 'Pending'
    })));
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/customer/loans', authenticateToken, async (req, res) => {
  try {
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
    res.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
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
      const [transactions] = await pool.query(
        'SELECT SUM(CASE WHEN TransactionType = "Deposit" THEN Amount ELSE -Amount END) as balance FROM transaction WHERE AccountID = ?',
        [account.AccountID]
      );
      return {
        ...account,
        balance: parseFloat(transactions[0].balance || 0)
      };
    }));
    
    res.json(accountsWithBalance);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/employees', authenticateToken, isEmployee, async (req, res) => {
  try {
    const [employees] = await pool.query('SELECT * FROM employee');
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
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

app.get('/api/admin/departments', authenticateToken, isEmployee, async (req, res) => {
  try {
    const [departments] = await pool.query('SELECT * FROM department');
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/atms', authenticateToken, isEmployee, async (req, res) => {
  try {
    const [atms] = await pool.query('SELECT * FROM atm');
    res.json(atms);
  } catch (error) {
    console.error('Get ATMs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/transactions', authenticateToken, isEmployee, async (req, res) => {
  try {
    const [transactions] = await pool.query(
      'SELECT * FROM transaction ORDER BY Date_Time DESC'
    );
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/loans', authenticateToken, isEmployee, async (req, res) => {
  try {
    const [loans] = await pool.query('SELECT * FROM loan_application ORDER BY AppDate DESC');
    res.json(loans.map(loan => ({
      ...loan,
      status: loan.ApprovedAmt ? 'Approved' : 'Pending'
    })));
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/accounts', authenticateToken, isEmployee, async (req, res) => {
  try {
    const { customerId, accountType, branchId } = req.body;
    
    if (!customerId || !accountType || !branchId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO bank_account (AccountNumber, OpenDate, AccountType, CustomerID, BranchID) VALUES (?, NOW(), ?, ?, ?)',
      [`ACC-${Date.now()}`, accountType, customerId, branchId]
    );
    
    const accountId = result.insertId;
    
    if (accountType === 'Savings') {
      await pool.query(
        'INSERT INTO savings_account (AccountID, InterestRate) VALUES (?, 5.0)',
        [accountId]
      );
    } else {
      await pool.query(
        'INSERT INTO checking_account (AccountID, OverdraftLimit) VALUES (?, 1000)',
        [accountId]
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;