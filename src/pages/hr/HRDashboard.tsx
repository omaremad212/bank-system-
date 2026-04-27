import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const HRDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    branches: 0,
  });
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [employeesData, departmentsData, branchesData] = await Promise.all([
          api.admin.getEmployees(),
          api.admin.getDepartments(),
          api.admin.getBranches(),
        ]);
        
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
        setStats({
          employees: Array.isArray(employeesData) ? employeesData.length : 0,
          departments: Array.isArray(departmentsData) ? departmentsData.length : 0,
          branches: Array.isArray(branchesData) ? branchesData.length : 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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
        <h1>Welcome, {user?.name}!</h1>
        <p>Human Resources Department - Employee Management</p>
        <div className="welcome-hero-info">
          <div className="welcome-info-item">
            <span>&#x1F4BC;</span>
            <span>HR Department</span>
          </div>
          <div className="welcome-info-item">
            <span>&#x1F4CB;</span>
            <span>Personnel Records</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon yellow">
              <span>&#x1F468;&#x200D;&#x1F4BB;</span>
            </div>
          </div>
          <h3>Employees</h3>
          <div className="stat-card-value yellow">{stats.employees}</div>
          <div className="stat-card-label">Total staff</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon green">
              <span>&#x1F3E2;</span>
            </div>
          </div>
          <h3>Departments</h3>
          <div className="stat-card-value green">{stats.departments}</div>
          <div className="stat-card-label">Active</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon blue">
              <span>&#x1F30D;</span>
            </div>
          </div>
          <h3>Branches</h3>
          <div className="stat-card-value blue">{stats.branches}</div>
          <div className="stat-card-label">Locations</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">
            <span>&#x1F4CB;</span>
            Employee Directory
          </h3>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Salary</th>
                <th>Role</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp: any) => (
                <tr key={emp.employeeid}>
                  <td>{emp.employeeid}</td>
                  <td>{emp.firstname && emp.lastname ? `${emp.firstname} ${emp.lastname}` : '-'}</td>
                  <td>{emp.gender || '-'}</td>
                  <td>${(emp.salary || 0).toLocaleString()}</td>
                  <td>{emp.roleType || '-'}</td>
                  <td>{emp.departmentname || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;