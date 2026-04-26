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

export default async function handler(request, response) {
  const user = authenticateToken(request);
  if (!user || user.type !== 'customer') {
    return response.status(403).json({ message: 'Customer access required' });
  }

  try {
    const result = await pool.query(
      `SELECT ba.accountid, ba.accountnumber, ba.opendate, ba.accounttype,
              COALESCE(sa.interestrate, 0) as interestrate, COALESCE(ca.overdraftlimit, 0) as overdraftlimit
       FROM bank_account ba 
       LEFT JOIN savings_account sa ON ba.accountid = sa.accountid
       LEFT JOIN checking_account ca ON ba.accountid = ca.accountid
       WHERE ba.customerid = $1`,
      [user.id]
    );

    const accountsWithBalance = await Promise.all(result.rows.map(async (account) => {
      const balance = await calculateBalance(account.accountid);
      // Return both lowercase and PascalCase for frontend compatibility
      return {
        // PascalCase (for frontend)
        AccountID: account.accountid,
        AccountNumber: account.accountnumber,
        AccountType: account.accounttype,
        OpenDate: account.opendate,
        interestRate: account.interestrate,
        overdraftLimit: account.overdraftlimit,
        balance,
        // lowercase (for backend)
        accountid: account.accountid,
        accountnumber: account.accountnumber,
        accounttype: account.accounttype,
        opendate: account.opendate,
        interestrate: account.interestrate,
        overdraftlimit: account.overdraftlimit,
      };
    }));

    return response.status(200).json(accountsWithBalance);
  } catch (error) {
    console.error('Get accounts error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}