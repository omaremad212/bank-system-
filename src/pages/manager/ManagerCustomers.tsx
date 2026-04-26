import { useState, useEffect } from 'react';
import api from '../../services/api';

const ManagerCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    gender: '',
    dateOfBirth: '',
    street: '',
    area: '',
    state: '',
    phone: '',
  });

  const fetchCustomers = async () => {
    try {
      const data = await api.admin.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, formData:', formData);
    try {
      if (editingCustomer) {
        console.log('Updating customer:', editingCustomer.CustomerID);
        await api.admin.updateCustomer(editingCustomer.CustomerID, formData);
      } else {
        console.log('Creating customer with data:', formData);
        await api.admin.createCustomer(formData);
      }
      setShowModal(false);
      setEditingCustomer(null);
      setFormData({
        firstName: '',
        lastName: '',
        nationalId: '',
        gender: '',
        street: '',
        area: '',
        state: '',
        dateOfBirth: '',
        phones: [''],
      });
      fetchCustomers();
    } catch (error: any) {
      console.error('Error saving customer:', error);
      alert(error.response?.data?.message || 'Error saving customer');
    }
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      firstName: customer.FirstName,
      lastName: customer.LastName,
      nationalId: customer.NationalID,
      gender: customer.Gender,
      dateOfBirth: customer.DateOfBirth || '',
      street: customer.Street || '',
      area: customer.Area || '',
      state: customer.State || '',
      phone: customer.phones?.[0] || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.admin.deleteCustomer(id);
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
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
          <h2 style={{ color: '#1a365d', marginBottom: '0.5rem' }}>Customer Management</h2>
          <p style={{ color: '#718096' }}>Manage all customer records</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingCustomer(null);
            setFormData({
              firstName: '',
              lastName: '',
              nationalId: '',
              gender: '',
              dateOfBirth: '',
              street: '',
              area: '',
              state: '',
              phone: '',
            });
            setShowModal(true);
          }}
        >
          <span>+</span> Add Customer
        </button>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>National ID</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer: any) => (
              <tr key={customer.CustomerID}>
                <td>{customer.CustomerID}</td>
                <td>{customer.FirstName} {customer.LastName}</td>
                <td>{customer.NationalID}</td>
                <td>{customer.Gender}</td>
                <td>{customer.phones?.[0] || 'N/A'}</td>
                <td>{customer.Street}, {customer.Area}</td>
                <td>
                  <button className="btn btn-sm btn-primary" onClick={() => handleEdit(customer)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(customer.CustomerID)} style={{ marginLeft: '0.5rem' }}>Delete</button>
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
              <h3>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <label className="form-label">National ID</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.nationalId}
                      onChange={e => setFormData({ ...formData, nationalId: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.dateOfBirth}
                      onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <label className="form-label">Street</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.street}
                    onChange={e => setFormData({ ...formData, street: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <label className="form-label">Area</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.area}
                      onChange={e => setFormData({ ...formData, area: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCustomer ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerCustomers;