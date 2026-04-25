import { useState, useEffect } from 'react';
import api from '../../services/api';

const ClerkAccounts = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await api.admin.getAccounts();
        setAccounts(data || []);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const groupedAccounts = accounts.reduce((acc: any, account: any) => {
    const customerId = account.CustomerID;
    if (!acc[customerId]) {
      acc[customerId] = {
        customerName: account.customerName,
        accounts: []
      };
    }
    acc[customerId].accounts.push(account);
    return acc;
  }, {});

  return (
    <div>
      <div className="welcome-hero">
        <h1>Account Management</h1>
        <p>View and manage customer bank accounts</p>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">
            <span>&#x1F4B3;</span>
            All Accounts
          </h3>
          <span className="badge badge-info">{accounts.length} accounts</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Account ID</th>
                <th>Account Number</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Balance</th>
                <th>Branch</th>
                <th>Open Date</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account: any) => (
                <tr key={account.AccountID}>
                  <td>#{account.AccountID}</td>
                  <td>
                    <code style={{ fontFamily: 'monospace' }}>{account.AccountNumber}</code>
                  </td>
                  <td style={{ fontWeight: 600 }}>{account.customerName || 'N/A'}</td>
                  <td>
                    <span className={`account-card-type ${account.AccountType?.toLowerCase()}`}>
                      {account.AccountType}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-green)' }}>
                    ${(account.balance || 0).toLocaleString()}
                  </td>
                  <td>{account.branchName || 'N/A'}</td>
                  <td>{account.OpenDate}</td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>
                      {account.type === 'Savings' && account.InterestRate && (
                        <div>Interest: {account.InterestRate}%</div>
                      )}
                      {account.type === 'Checking' && account.OverdraftLimit && (
                        <div>Overdraft: ${account.OverdraftLimit}</div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="welcome-hero" style={{ marginTop: '2rem' }}>
        <h1>Accounts by Customer</h1>
        <p>View all accounts grouped by customer</p>
      </div>

      {Object.entries(groupedAccounts).map(([customerId, data]: [string, any]) => (
        <div key={customerId} className="table-card" style={{ marginBottom: '1.5rem' }}>
          <div className="table-header">
            <h3 className="table-title">
              <span>&#x1F464;</span>
              {data.customerName}
            </h3>
            <span className="badge badge-info">{data.accounts.length} accounts</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Account #</th>
                  <th>Type</th>
                  <th>Balance</th>
                  <th>Interest/Overdraft</th>
                </tr>
              </thead>
              <tbody>
                {data.accounts.map((acc: any) => (
                  <tr key={acc.AccountID}>
                    <td><code>{acc.AccountNumber}</code></td>
                    <td>
                      <span className={`account-card-type ${acc.AccountType?.toLowerCase()}`}>
                        {acc.AccountType}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-green)' }}>
                      ${(acc.balance || 0).toLocaleString()}
                    </td>
                    <td>
                      {acc.type === 'Savings' && acc.InterestRate && `${acc.InterestRate}% interest`}
                      {acc.type === 'Checking' && acc.OverdraftLimit && `$${acc.OverdraftLimit} overdraft`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClerkAccounts;