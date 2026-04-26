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
    }

    if (method === 'POST') {
      if (action === 'branches') {
        const { branchName, location, email, establishedYear } = request.body;
        const result = await pool.query(
          `INSERT INTO branch (branchname, location, email, establishedyear) VALUES ($1, $2, $3, $4) RETURNING branchid`,
          [branchName, location, email, establishedYear]
        );
        return response.status(201).json({ message: 'Branch created', branchId: result.rows[0].branchid });
      }

      if (action === 'departments') {
        const { departmentName, branchId } = request.body;
        const result = await pool.query(
          `INSERT INTO department (departmentname, branchid) VALUES ($1, $2) RETURNING departmentid`,
          [departmentName, branchId || 1]
        );
        return response.status(201).json({ message: 'Department created', departmentId: result.rows[0].departmentid });
      }

      if (action === 'transactions') {
        const { amount, transactionType, accountId, relatedAccountId, atmId } = request.body;
        const result = await pool.query(
          `INSERT INTO transaction (amount, transactiontype, accountid, relatedaccountid, atmid, date_time)
           VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING transactionid`,
          [amount, transactionType, accountId, relatedAccountId, atmId]
        );
        return response.status(201).json({ message: 'Transaction created', transactionId: result.rows[0].transactionid });
      }

      if (action === 'loans') {
        const { customerId, appDate, startDate, endDate, approvedAmt, status } = request.body;
        const result = await pool.query(
          `INSERT INTO loan_application (appdate, startdate, enddate, approvedamt, status, customerid)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING applicationid`,
          [appDate || new Date(), startDate, endDate, approvedAmt, status || 'Pending', customerId]
        );
        return response.status(201).json({ message: 'Loan created', applicationId: result.rows[0].applicationid });
      }

      if (action === 'atms') {
        const { location, status, branchId } = request.body;
        const result = await pool.query(
          `INSERT INTO atm (location, status, branchid, installdate) VALUES ($1, $2, $3, CURRENT_DATE) RETURNING atmid`,
          [location, status || 'Active', branchId]
        );
        return response.status(201).json({ message: 'ATM created', atmId: result.rows[0].atmid });
      }
    }

    if (method === 'PUT') {
      if (action === 'branches') {
        const id = request.query.id || request.query.id;
        const { branchName, location, email, establishedYear } = request.body;
        await pool.query(
          `UPDATE branch SET branchname = $1, location = $2, email = $3, establishedyear = $4 WHERE branchid = $5`,
          [branchName, location, email, establishedYear, id]
        );
        return response.status(200).json({ message: 'Branch updated' });
      }

      if (action === 'departments') {
        const id = request.query.id || request.query.id;
        const { departmentName, branchId } = request.body;
        await pool.query(
          `UPDATE department SET departmentname = $1, branchid = $2 WHERE departmentid = $3`,
          [departmentName, branchId, id]
        );
        return response.status(200).json({ message: 'Department updated' });
      }

      if (action === 'loans') {
        const id = request.query.id || request.query.id;
        const { status, approvedAmt } = request.body;
        await pool.query(
          `UPDATE loan_application SET status = $1, approvedamt = $2 WHERE applicationid = $3`,
          [status, approvedAmt, id]
        );
        return response.status(200).json({ message: 'Loan updated' });
      }

      if (action === 'atms') {
        const id = request.query.id || request.query.id;
        const { location, status, branchId } = request.body;
        await pool.query(
          `UPDATE atm SET location = $1, status = $2, branchid = $3 WHERE atmid = $4`,
          [location, status, branchId, id]
        );
        return response.status(200).json({ message: 'ATM updated' });
      }
    }

    if (method === 'DELETE') {
      if (action === 'branches') {
        const id = request.query.id || request.query.id;
        await pool.query('DELETE FROM branch WHERE branchid = $1', [id]);
        return response.status(200).json({ message: 'Branch deleted' });
      }

      if (action === 'departments') {
        const id = request.query.id || request.query.id;
        await pool.query('DELETE FROM department WHERE departmentid = $1', [id]);
        return response.status(200).json({ message: 'Department deleted' });
      }

      if (action === 'transactions') {
        const id = request.query.id || request.query.id;
        await pool.query('DELETE FROM transaction WHERE transactionid = $1', [id]);
        return response.status(200).json({ message: 'Transaction deleted' });
      }

      if (action === 'loans') {
        const id = request.query.id || request.query.id;
        await pool.query('DELETE FROM loan_application WHERE applicationid = $1', [id]);
        return response.status(200).json({ message: 'Loan deleted' });
      }

      if (action === 'atms') {
        const id = request.query.id || request.query.id;
        await pool.query('DELETE FROM atm WHERE atmid = $1', [id]);
        return response.status(200).json({ message: 'ATM deleted' });
      }
    }

    return response.status(400).json({ message: 'Invalid action or method' });
  } catch (error) {
    console.error('Admin data API error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}