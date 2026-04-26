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
  if (!user || user.type !== 'customer') {
    return response.status(403).json({ message: 'Customer access required' });
  }

  const accountId = request.query.accountId || request.query.accountid;

  try {
    let query = 'SELECT transactionid, amount, date_time, transactiontype, accountid, relatedaccountid, atmid FROM transaction WHERE 1=1';
    const params = [];
    
    if (user.type === 'customer') {
      query += ' AND accountid IN (SELECT accountid FROM bank_account WHERE customerid = $1)';
      params.push(user.id);
    }
    
    if (accountId) {
      query += ' AND accountid = $' + (params.length + 1);
      params.push(accountId);
    }
    
    query += ' ORDER BY date_time DESC LIMIT 50';
    
    const result = await pool.query(query, params);

    // Return both lowercase and PascalCase for frontend
    const transactions = result.rows.map(row => ({
      // PascalCase
      TransactionID: row.transactionid,
      Amount: row.amount,
      Date_Time: row.date_time,
      TransactionType: row.transactiontype,
      AccountID: row.accountid,
      RelatedAccountID: row.relatedaccountid,
      ATMID: row.atmid,
      // lowercase
      transactionid: row.transactionid,
      amount: row.amount,
      date_time: row.date_time,
      transactiontype: row.transactiontype,
      accountid: row.accountid,
      relatedaccountid: row.relatedaccountid,
      atmid: row.atmid,
    }));

    return response.status(200).json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}