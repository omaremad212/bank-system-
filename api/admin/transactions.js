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

  try {
    const result = await pool.query(
      'SELECT t.transactionid, t.amount, t.date_time, t.transactiontype, t.accountid, t.relatedaccountid, t.atmid, ba.accountnumber FROM transaction t LEFT JOIN bank_account ba ON t.accountid = ba.accountid ORDER BY t.date_time DESC LIMIT 100'
    );

    const transactions = result.rows.map(row => ({
      // PascalCase
      TransactionID: row.transactionid,
      Amount: row.amount,
      Date_Time: row.date_time,
      TransactionType: row.transactiontype,
      AccountID: row.accountid,
      RelatedAccountID: row.relatedaccountid,
      ATMID: row.atmid,
      AccountNumber: row.accountnumber,
      // lowercase
      transactionid: row.transactionid,
      amount: row.amount,
      date_time: row.date_time,
      transactiontype: row.transactiontype,
      accountid: row.accountid,
      relatedaccountid: row.relatedaccountid,
      atmid: row.atmid,
      accountnumber: row.accountnumber,
    }));

    return response.status(200).json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}