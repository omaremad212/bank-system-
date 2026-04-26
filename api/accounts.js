import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const authenticateToken = async (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return null;
  try {
    const jwt = await import('jsonwebtoken');
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
  } catch (e) {
    console.log('Auth error:', e);
    return null;
  }
};

const calculateBalance = async (accountId) => {
  try {
    const result = await pool.query(
      'SELECT COALESCE(SUM(CASE WHEN "TransactionType" = $1 THEN "Amount" ELSE -"Amount" END), 0) as balance FROM transaction WHERE "AccountID" = $2',
      ['Deposit', accountId]
    );
    return parseFloat(result.rows[0]?.balance || 0);
  } catch (e) {
    console.log('calculateBalance error:', e);
    return 0;
  }
};

export default async function handler(request, response) {
  const user = await authenticateToken(request);
  if (!user || user.type !== 'employee') {
    return response.status(403).json({ message: 'Employee access required' });
  }

  try {
    const result = await pool.query(
      `SELECT ba.*, CASE WHEN sa."AccountID" IS NOT NULL THEN 'Savings' ELSE 'Checking' END as accounttypename
       FROM bank_account ba LEFT JOIN savings_account sa ON ba."AccountID" = sa."AccountID"`
    );

    const accountsWithBalance = await Promise.all(result.rows.map(async (account) => {
      const balance = await calculateBalance(account.AccountID);
      const customerResult = await pool.query('SELECT * FROM customer WHERE "CustomerID" = $1', [account.CustomerID]);
      const branchResult = await pool.query('SELECT * FROM branch WHERE "BranchID" = $1', [account.BranchID]);
      return {
        ...account,
        balance,
        customerName: customerResult.rows[0] ? `${customerResult.rows[0].FirstName} ${customerResult.rows[0].LastName}` : null,
        branchName: branchResult.rows[0]?.BranchName,
      };
    }));

    return response.status(200).json(accountsWithBalance);
  } catch (error) {
    console.error('Get accounts error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}