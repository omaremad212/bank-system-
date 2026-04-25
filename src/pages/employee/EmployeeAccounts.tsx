import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BankAccount, Customer } from '../../types';

const EmployeeAccounts = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    CustomerID: 0,
    AccountType: 'Savings',
    BranchID: 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accData, custData] = await Promise.all([
          api.accounts.getAll(),
          api.customers.getAll(),
        ]);
        setAccounts(accData);
        setCustomers(custData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.accounts.create({
        CustomerID: formData.CustomerID,
        AccountType: formData.AccountType as 'Savings' | 'Checking',
        BranchID: formData.BranchID,
      });
      const updatedAccounts = await api.accounts.getAll();
      setAccounts(updatedAccounts);
      setShowModal(false);
      setFormData({ CustomerID: 0, AccountType: 'Savings', BranchID: 1 });
    } catch (error) {
      console.error('Error creating account:', error);
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
          <h1>Accounts</h1>
          <p>Manage bank accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Create Account
        </button>
      </div>

      <div className="card">
        {accounts.length === 0 ? (
          <div className="empty-state">
            <p>No accounts found</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Account ID</th>
                  <th>Account Number</th>
                  <th>Type</th>
                  <th>Customer ID</th>
                  <th>Branch ID</th>
                  <th>Open Date</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.AccountID}>
                    <td>{account.AccountID}</td>
                    <td>{account.AccountNumber}</td>
                    <td>
                      <span className={`badge badge-${account.AccountType === 'Savings' ? 'primary' : 'success'}`}>
                        {account.AccountType}
                      </span>
                    </td>
                    <td>{account.CustomerID}</td>
                    <td>{account.BranchID}</td>
                    <td>{account.OpenDate}</td>
                    <td>${account.balance?.toLocaleString() || 0}</td>
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
              <h3>Create Account</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group mb-2">
                  <label>Customer</label>
                  <select
                    value={formData.CustomerID}
                    onChange={(e) => setFormData({ ...formData, CustomerID: Number(e.target.value) })}
                    required
                  >
                    <option value={0}>Select Customer</option>
                    {customers.map((customer) => (
                      <option key={customer.CustomerID} value={customer.CustomerID}>
                        {customer.FirstName} {customer.LastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group mb-2">
                  <label>Account Type</label>
                  <select
                    value={formData.AccountType}
                    onChange={(e) => setFormData({ ...formData, AccountType: e.target.value })}
                  >
                    <option value="Savings">Savings</option>
                    <option value="Checking">Checking</option>
                  </select>
                </div>
                <div className="form-group mb-2">
                  <label>Branch ID</label>
                  <input
                    type="number"
                    value={formData.BranchID}
                    onChange={(e) => setFormData({ ...formData, BranchID: Number(e.target.value) })}
                    required
                  />
                </div>
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAccounts;