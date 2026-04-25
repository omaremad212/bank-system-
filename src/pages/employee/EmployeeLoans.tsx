import { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoanApplication } from '../../types';

const EmployeeLoans = () => {
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const data = await api.admin.getLoans();
        setLoans(data);
      } catch (error) {
        console.error('Error fetching loans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
<div>
      <div className="welcome-hero">
        <div>
          <h1>Loan Applications</h1>
          <p>Manage loan applications</p>
        </div>
      </div>

      <div className="table-card">
        {loans.length === 0 ? (
          <div className="empty-state">
            <p>No loan applications found</p>
          </div>
) : (
          <table>
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Date Applied</th>
                  <th>Customer ID</th>
                  <th>Amount</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.ApplicationID}>
                    <td>#{loan.ApplicationID}</td>
                    <td>{loan.AppDate}</td>
                    <td>{loan.CustomerID}</td>
                    <td>${loan.ApprovedAmt?.toLocaleString()}</td>
                    <td>{loan.StartDate || 'N/A'}</td>
                    <td>{loan.EndDate || 'N/A'}</td>
                    <td>
                      <span className={`badge badge-${loan.status === 'Approved' ? 'success' : loan.status === 'Rejected' ? 'danger' : 'warning'}`}>
                        {loan.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
</table>
        )}
      </div>
    </div>
  );
};

export default EmployeeLoans;
