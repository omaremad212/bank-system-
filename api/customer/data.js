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

export default async function handler(request, response) {
  const user = authenticateToken(request);
  if (!user || user.type !== 'customer') {
    return response.status(403).json({ message: 'Customer access required' });
  }

  const action = request.query.action || request.query.action;

  try {
    if (action === 'profile' || !action) {
      const customerResult = await pool.query('SELECT * FROM customer WHERE customerid = $1', [user.id]);
      if (customerResult.rows.length === 0) {
        return response.status(404).json({ message: 'Customer not found' });
      }
      const customer = customerResult.rows[0];
      const phonesResult = await pool.query('SELECT phone FROM customer_phone WHERE customerid = $1', [customer.customerid]);
      const accountsResult = await pool.query(
        `SELECT ba.accountid, ba.accountnumber, ba.opendate, ba.accounttype,
                COALESCE(sa.interestrate, 0) as interestrate, COALESCE(ca.overdraftlimit, 0) as overdraftlimit
         FROM bank_account ba 
         LEFT JOIN savings_account sa ON ba.accountid = sa.accountid
         LEFT JOIN checking_account ca ON ba.accountid = ca.accountid
         WHERE ba.customerid = $1`,
        [user.id]
      );
      const accountsWithBalance = await Promise.all(accountsResult.rows.map(async (account) => {
        const balance = await calculateBalance(account.accountid);
        return {
          accountid: account.accountid,
          accountnumber: account.accountnumber,
          accounttype: account.accounttype,
          opendate: account.opendate,
          interestrate: account.interestrate,
          overdraftlimit: account.overdraftlimit,
          balance,
        };
      }));
      return response.status(200).json({
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
        accounts: accountsWithBalance,
      });
    }

    if (action === 'accounts') {
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
        return {
          accountid: account.accountid,
          accountnumber: account.accountnumber,
          accounttype: account.accounttype,
          opendate: account.opendate,
          interestrate: account.interestrate,
          overdraftlimit: account.overdraftlimit,
          balance,
        };
      }));
      return response.status(200).json(accountsWithBalance);
    }

    if (action === 'transactions') {
      const accountId = request.query.accountId || request.query.accountid;
      let query = 'SELECT transactionid, amount, date_time, transactiontype, accountid, relatedaccountid, atmid FROM transactions WHERE accountid IN (SELECT accountid FROM bank_account WHERE customerid = $1)';
      const params = [user.id];
      if (accountId) {
        query += ' AND accountid = $2';
        params.push(accountId);
      }
      query += ' ORDER BY date_time DESC LIMIT 50';
      const result = await pool.query(query, params);
      const transactions = result.rows.map(row => ({
        transactionid: row.transactionid,
        amount: row.amount,
        date_time: row.date_time,
        transactiontype: row.transactiontype,
        accountid: row.accountid,
        relatedaccountid: row.relatedaccountid,
        atmid: row.atmid,
      }));
      return response.status(200).json(transactions);
    }

    if (action === 'loans') {
      const result = await pool.query(
        'SELECT applicationid, appdate, startdate, enddate, approvedamt, customerid FROM loan_application WHERE customerid = $1 ORDER BY appdate DESC',
        [user.id]
      );
      const loans = result.rows.map(row => ({
        applicationid: row.applicationid,
        appdate: row.appdate,
        startdate: row.startdate,
        enddate: row.enddate,
        approvedamt: row.approvedamt,
        customerid: row.customerid,
      }));
      return response.status(200).json(loans);
    }

    return response.status(400).json({ message: 'Invalid action' });
  } catch (error) {
    console.error('Get customer data error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}