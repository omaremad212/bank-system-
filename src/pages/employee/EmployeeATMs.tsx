import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ATM } from '../../types';

const EmployeeATMs = () => {
  const [atms, setAtms] = useState<ATM[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchATMs = async () => {
      try {
        const data = await api.admin.getATMs();
        setAtms(data);
      } catch (error) {
        console.error('Error fetching ATMs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchATMs();
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
          <h1>ATMs</h1>
          <p>Manage ATM machines</p>
        </div>
      </div>

      <div className="table-card">
        {atms.length === 0 ? (
          <div className="empty-state">
            <p>No ATMs found</p>
          </div>
) : (
          <table>
              <thead>
                <tr>
                  <th>ATM ID</th>
                  <th>Location</th>
                  <th>Install Date</th>
                  <th>Branch ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {atms.map((atm) => (
                  <tr key={atm.ATMID}>
                    <td>{atm.ATMID}</td>
                    <td>{atm.Location}</td>
                    <td>{atm.InstallDate}</td>
                    <td>{atm.BranchID || 'N/A'}</td>
                    <td>
                      <span className={`badge badge-${atm.Status === 'Active' ? 'success' : 'danger'}`}>
                        {atm.Status}
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

export default EmployeeATMs;
