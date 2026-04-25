import { useState, useEffect } from 'react';
import api from '../../services/api';

const ManagerLoans = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    approvedAmt: 0,
    startDate: '',
    endDate: '',
    status: 'Pending',
  });

  const fetchData = async () => {
    try {
      const [loansData, customersData] = await Promise.all([
        api.admin.getLoans(),
        api.admin.getCustomers(),
      ]);
      setLoans(loansData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createLoan(formData);
      setShowModal(false);
      setFormData({
        customerId: '',
        approvedAmt: 0,
        startDate: '',
        endDate: '',
        status: 'Pending',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating loan:', error);
    }
  };

  const handleApprove = async (id: number) => {
    const loan = loans.find(l => l.ApplicationID === id);
    if (loan) {
      await api.admin.updateLoan(id, { 
        Status: 'Approved',
        StartDate: new Date().toISOString().split('T')[0],
        EndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      fetchData();
    }
  };

  const handleReject = async (id: number) => {
    await api.admin.updateLoan(id, { Status: 'Rejected' });
    fetchData();
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#1a365d', marginBottom: '0.5rem' }}>Loan Management</h2>
          <p style={{ color: '#718096' }}>Manage loan applications</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <span>+</span> Create Loan
        </button>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Application Date</th>
              <th>Approved Amount</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan: any) => (
              <tr key={loan.ApplicationID}>
                <td>{loan.ApplicationID}</td>
                <td>{loan.customerName}</td>
                <td>{loan.AppDate}</td>
                <td>${(loan.ApprovedAmt || 0).toLocaleString()}</td>
                <td>
                  <span className={`badge ${loan.Status === 'Approved' ? 'badge-success' : loan.Status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                    {loan.Status}
                  </span>
                </td>
                <td>{loan.StartDate || '-'}</td>
                <td>{loan.EndDate || '-'}</td>
                <td>
                  {loan.Status === 'Pending' && (
                    <>
                      <button className="btn btn-sm btn-success" onClick={() => handleApprove(loan.ApplicationID)}>Approve</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleReject(loan.ApplicationID)} style={{ marginLeft: '0.5rem' }}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Loan</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div>
                  <label className="form-label">Customer</label>
                  <select
                    className="form-select"
                    value={formData.customerId}
                    onChange={e => setFormData({ ...formData, customerId: Number(e.target.value) })}
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers.map((c: any) => (
                      <option key={c.CustomerID} value={c.CustomerID}>
                        {c.FirstName} {c.LastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <label className="form-label">Approved Amount ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.approvedAmt}
                    onChange={e => setFormData({ ...formData, approvedAmt: Number(e.target.value) })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerLoans;