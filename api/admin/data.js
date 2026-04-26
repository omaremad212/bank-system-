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

  const action = request.query.action || request.query.action;

  try {
    if (action === 'branches' || !action) {
      const result = await pool.query('SELECT branchid, branchname, location, email, establishedyear FROM branch ORDER BY branchid');
      const branches = result.rows.map(row => ({
        BranchID: row.branchid,
        BranchName: row.branchname,
        Location: row.location,
        Email: row.email,
        EstablishedYear: row.establishedyear,
      }));
      return response.status(200).json(branches);
    }

    if (action === 'departments') {
      const result = await pool.query('SELECT departmentid, departmentname, branchid FROM department ORDER BY departmentid');
      const departments = result.rows.map(row => ({
        DepartmentID: row.departmentid,
        DepartmentName: row.departmentname,
        BranchID: row.branchid,
      }));
      return response.status(200).json(departments);
    }

    if (action === 'transactions') {
      const result = await pool.query(
        'SELECT t.transactionid, t.amount, t.date_time, t.transactiontype, t.accountid, t.relatedaccountid, t.atmid, ba.accountnumber FROM transaction t LEFT JOIN bank_account ba ON t.accountid = ba.accountid ORDER BY t.date_time DESC LIMIT 100'
      );
      const transactions = result.rows.map(row => ({
        TransactionID: row.transactionid,
        Amount: row.amount,
        Date_Time: row.date_time,
        TransactionType: row.transactiontype,
        AccountID: row.accountid,
        RelatedAccountID: row.relatedaccountid,
        ATMID: row.atmid,
        AccountNumber: row.accountnumber,
      }));
      return response.status(200).json(transactions);
    }

    if (action === 'loans') {
      const result = await pool.query('SELECT applicationid, appdate, startdate, enddate, approvedamt, status, customerid FROM loan_application ORDER BY appdate DESC');
      const loans = result.rows.map(row => ({
        ApplicationID: row.applicationid,
        AppDate: row.appdate,
        StartDate: row.startdate,
        EndDate: row.enddate,
        ApprovedAmt: row.approvedamt,
        Status: row.status,
        CustomerID: row.customerid,
      }));
      return response.status(200).json(loans);
    }

    if (action === 'atms') {
      const result = await pool.query('SELECT atmid, location, installdate, status, branchid FROM atm ORDER BY atmid');
      const atms = result.rows.map(row => ({
        ATMID: row.atmid,
        Location: row.location,
        InstallDate: row.installdate,
        Status: row.status,
        BranchID: row.branchid,
      }));
      return response.status(200).json(atms);
    }

    return response.status(400).json({ message: 'Invalid action' });
  } catch (error) {
    console.error('Get admin data error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}