import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LoanApplication } from '../../types';

const CustomerLoans = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const customerId = (user as any).CustomerID || 1;
        const data = await api.loans.getByCustomerId(customerId);
        setLoans(data);
      } catch (error) {
        console.error('Error fetching loans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, [user]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    try {
      await api.loans.create({
        CustomerID: (user as any).CustomerID || 1,
        ApprovedAmt: parseFloat(amount),
      });

      setSuccess(true);
      setMessage('Loan application submitted successfully!');

      const customerId = (user as any).CustomerID || 1;
      const updatedLoans = await api.loans.getByCustomerId(customerId);
      setLoans(updatedLoans);
    } catch (error) {
      setMessage('Failed to apply for loan. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Loans</h1>
          <p>View and manage your loan applications</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Apply for Loan
        </button>
      </div>

      <div className="grid grid-3 mb-3">
        <div className="stat-card">
          <div className="stat-card-label">Total Loans</div>
          <div className="stat-card-value">{loans.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Approved</div>
          <div className="stat-card-value success">
            {loans.filter((l) => l.status === 'Approved').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Pending</div>
          <div className="stat-card-value warning">
            {loans.filter((l) => l.status === 'Pending').length}
          </div>
        </div>
      </div>

      <div className="card">
        {loans.length === 0 ? (
          <div className="empty-state">
            <p>No loan applications yet</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Apply for your first loan
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Date Applied</th>
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
                    <td>${loan.ApprovedAmt?.toLocaleString() || 'N/A'}</td>
                    <td>{loan.StartDate || 'N/A'}</td>
                    <td>{loan.EndDate || 'N/A'}</td>
                    <td>
                      <span className={`badge badge-${loan.status === 'Approved' ? 'success' : loan.status === 'Rejected' ? 'danger' : 'warning'}`}>
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Apply for Loan</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleApply}>
              <div className="modal-body">
                <div className="form-group mb-2">
                  <label>Loan Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter loan amount"
                    min="1000"
                    step="100"
                    required
                  />
                </div>
                {message && (
                  <div className={`badge ${success ? 'badge-success' : 'badge-danger'}`}>
                    {message}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLoans;