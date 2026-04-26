import { useState, useEffect } from 'react';
import api from '../../services/api';

const EmployeeCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        <div>
          <h1>Customers</h1>
          <p>Customer records with phone numbers</p>
        </div>
      </div>

      <div className="table-card">
        {customers.length === 0 ? (
          <div className="empty-state">
            <p>No customers found</p>
          </div>
) : (
          <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>National ID</th>
                  <th>Gender</th>
                  <th>Address</th>
                  <th>Date of Birth</th>
                  <th>Phones</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.customerid || customer.id}>
                    <td>{customer.customerid || customer.id || '-'}</td>
                    <td>{customer.firstname && customer.lastname ? `${customer.firstname} ${customer.lastname}` : '-'}</td>
                    <td>{customer.nationalid || '-'}</td>
                    <td>{customer.gender || '-'}</td>
                    <td>{customer.street || customer.area || customer.state ? `${customer.street || ''}, ${customer.area || ''}, ${customer.state || ''}`.replace(/^, |, $/g, '') : '-'}</td>
                    <td>{customer.dateofbirth || '-'}</td>
                    <td>{customer.phones?.join(', ') || '-'}</td>
                  </tr>
                ))}
              </tbody>
</table>
        )}
      </div>
    </div>
  );
};

export default EmployeeCustomers;
