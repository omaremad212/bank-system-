import { useState, useEffect } from 'react';
import api from '../../services/api';

const ClerkCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await api.admin.getCustomers();
        setCustomers(data || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
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
        <h1>Customer Management</h1>
        <p>View and manage customer information</p>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">
            <span>&#x1F465;</span>
            All Customers
          </h3>
          <span className="badge badge-info">{customers.length} customers</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>National ID</th>
                <th>Gender</th>
                <th>Address</th>
                <th>Date of Birth</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.CustomerID}>
                  <td>#{customer.CustomerID}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {customer.FirstName} {customer.LastName}
                    </div>
                  </td>
                  <td>
                    <code style={{ fontFamily: 'monospace' }}>{customer.NationalID}</code>
                  </td>
                  <td>{customer.Gender}</td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      <div>{customer.Street}</div>
                      <div style={{ color: 'var(--text-muted)' }}>
                        {customer.Area}, {customer.State}
                      </div>
                    </div>
                  </td>
                  <td>{customer.DateOfBirth}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Customer Details</h3>
              <button className="modal-close" onClick={() => setSelectedCustomer(null)}>
                &#x2715;
              </button>
            </div>
            <div className="modal-body">
              <div className="profile-card-content">
                <div className="profile-item">
                  <label>Customer ID</label>
                  <span>#{selectedCustomer.CustomerID}</span>
                </div>
                <div className="profile-item">
                  <label>Full Name</label>
                  <span>{selectedCustomer.FirstName} {selectedCustomer.LastName}</span>
                </div>
                <div className="profile-item">
                  <label>National ID</label>
                  <span>{selectedCustomer.NationalID}</span>
                </div>
                <div className="profile-item">
                  <label>Gender</label>
                  <span>{selectedCustomer.Gender}</span>
                </div>
                <div className="profile-item">
                  <label>Date of Birth</label>
                  <span>{selectedCustomer.DateOfBirth}</span>
                </div>
                <div className="profile-item">
                  <label>Street</label>
                  <span>{selectedCustomer.Street}</span>
                </div>
                <div className="profile-item">
                  <label>Area</label>
                  <span>{selectedCustomer.Area}</span>
                </div>
                <div className="profile-item">
                  <label>State</label>
                  <span>{selectedCustomer.State}</span>
                </div>
              </div>
              
              {selectedCustomer.phones && selectedCustomer.phones.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    Phone Numbers
                  </h4>
                  <div className="phone-list">
                    {selectedCustomer.phones.map((phone: string, idx: number) => (
                      <div key={idx} className="phone-item">
                        <div className="phone-icon">&#x1F4F1;</div>
                        <span>{phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedCustomer(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClerkCustomers;