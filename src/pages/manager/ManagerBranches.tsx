import { useState, useEffect } from 'react';
import api from '../../services/api';

const ManagerBranches = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [atms, setATMs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    status: 'Active',
    branchId: 1,
  });

  const fetchData = async () => {
    try {
      const [branchesData, departmentsData, atmsData] = await Promise.all([
        api.admin.getBranches(),
        api.admin.getDepartments(),
        api.admin.getATMs(),
      ]);
      setBranches(branchesData);
      setDepartments(departmentsData);
      setATMs(atmsData);
    } catch (error) {
      console.error('Error fetching data:', error);
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
      await api.admin.createATM(formData);
      setShowModal(false);
      setFormData({
        location: '',
        status: 'Active',
        branchId: 1,
      });
      fetchData();
    } catch (error) {
      console.error('Error creating ATM:', error);
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
          <h2 style={{ color: '#1a365d', marginBottom: '0.5rem' }}>Branches & Departments</h2>
          <p style={{ color: '#718096' }}>Manage branches and ATM locations</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <span>+</span> Add ATM
        </button>
      </div>

      <h3 style={{ color: '#1a365d', marginBottom: '1rem' }}>Branches</h3>
      <div className="table-card" style={{ marginBottom: '2rem' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Branch Name</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((branch: any) => (
              <tr key={branch.BranchID}>
                <td>{branch.BranchID}</td>
                <td>{branch.BranchName}</td>
                <td>{branch.Location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ color: '#1a365d', marginBottom: '1rem' }}>Departments</h3>
      <div className="table-card" style={{ marginBottom: '2rem' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Department Name</th>
              <th>Branch</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept: any) => (
              <tr key={dept.DepartmentID}>
                <td>{dept.DepartmentID}</td>
                <td>{dept.DepartmentName}</td>
                <td>{dept.branchName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ color: '#1a365d', marginBottom: '1rem' }}>ATMs</h3>
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Location</th>
              <th>Install Date</th>
              <th>Status</th>
              <th>Branch</th>
            </tr>
          </thead>
          <tbody>
            {atms.map((atm: any) => (
              <tr key={atm.ATMID}>
                <td>{atm.ATMID}</td>
                <td>{atm.Location}</td>
                <td>{atm.InstallDate}</td>
                <td>
                  <span className={`badge ${atm.Status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                    {atm.Status}
                  </span>
                </td>
                <td>{atm.branchName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New ATM</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div>
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
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
                <div style={{ marginTop: '1rem' }}>
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Maintenance">Maintenance</option>
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

export default ManagerBranches;