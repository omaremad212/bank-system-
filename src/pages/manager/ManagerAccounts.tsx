import { useState, useEffect } from 'react';
import api from '../../services/api';

const ManagerAccounts = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    accountType: 'Savings',
    branchId: 1,
    interestRate: 5.0,
    overdraftLimit: 1000,
  });

  const fetchData = async () => {
    try {
      const [accountsData, customersData, branchesData] = await Promise.all([
        api.admin.getAccounts(),
        api.admin.getCustomers(),
        api.admin.getBranches(),
      ]);
      setAccounts(accountsData);
      setCustomers(customersData);
      setBranches(branchesData);
    } catch (error) {
      console.error('Error fetching accounts:', error);
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
      await api.admin.createAccount(formData);
      setShowModal(false);
      setFormData({
        customerId: '',
        accountType: 'Savings',
        branchId: 1,
        interestRate: 5.0,
        overdraftLimit: 1000,
      });
      fetchData();
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await api.admin.deleteAccount(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#1a365d', marginBottom: '0.5rem' }}>Account Management</h2>
          <p style={{ color: '#718096' }}>Manage all bank accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <span>+</span> Add Account
        </button>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Account Number</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Balance</th>
              <th>Branch</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account: any) => (
              <tr key={account.AccountID}>
                <td>{account.AccountID}</td>
                <td>{account.AccountNumber}</td>
                <td>{account.customerName}</td>
                <td>
                  <span className={`badge ${account.AccountType === 'Savings' ? 'badge-success' : 'badge-info'}`}>
                    {account.AccountType}
                  </span>
                </td>
                <td>${(account.balance || 0).toLocaleString()}</td>
                <td>{account.branchName}</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(account.AccountID)}>Delete</button>
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
              <h3>Create New Account</h3>
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
                        {c.FirstName} {c.LastName} ({c.NationalID})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <label className="form-label">Account Type</label>
                  <select
                    className="form-select"
                    value={formData.accountType}
                    onChange={e => setFormData({ ...formData, accountType: e.target.value })}
                    required
                  >
                    <option value="Savings">Savings Account</option>
                    <option value="Checking">Checking Account</option>
                  </select>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <label className="form-label">Branch</label>
                  <select
                    className="form-select"
                    value={formData.branchId}
                    onChange={e => setFormData({ ...formData, branchId: Number(e.target.value) })}
                    required
                  >
                    {branches.map((b: any) => (
                      <option key={b.BranchID} value={b.BranchID}>{b.BranchName}</option>
                    ))}
                  </select>
                </div>
                {formData.accountType === 'Savings' && (
                  <div style={{ marginTop: '1rem' }}>
                    <label className="form-label">Interest Rate (%)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.interestRate}
                      onChange={e => setFormData({ ...formData, interestRate: Number(e.target.value) })}
                      step="0.1"
                    />
                  </div>
                )}
                {formData.accountType === 'Checking' && (
                  <div style={{ marginTop: '1rem' }}>
                    <label className="form-label">Overdraft Limit ($)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.overdraftLimit}
                      onChange={e => setFormData({ ...formData, overdraftLimit: Number(e.target.value) })}
                    />
                  </div>
                )}
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

export default ManagerAccounts;