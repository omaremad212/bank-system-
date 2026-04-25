import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ITDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    employees: 0,
    branches: 0,
    atms: 0,
    systems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [employees, branches, atms] = await Promise.all([
          api.admin.getEmployees(),
          api.admin.getBranches(),
          api.admin.getATMs(),
        ]);
        
        setStats({
          employees: Array.isArray(employees) ? employees.length : 0,
          branches: Array.isArray(branches) ? branches.length : 0,
          atms: Array.isArray(atms) ? atms.length : 0,
          systems: 12,
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
        <p>IT Department Dashboard - System Administration</p>
        <div className="welcome-hero-info">
          <div className="welcome-info-item">
            <span>&#x1F4BB;</span>
            <span>IT Department</span>
          </div>
          <div className="welcome-info-item">
            <span>&#x1F5A5;&#xFE0F;</span>
            <span>System Support</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon cyan">
              <span>&#x1F4BB;</span>
            </div>
          </div>
          <h3>Employees</h3>
          <div className="stat-card-value cyan">{stats.employees}</div>
          <div className="stat-card-label">System users</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon green">
              <span>&#x1F3E2;</span>
            </div>
          </div>
          <h3>Branches</h3>
          <div className="stat-card-value green">{stats.branches}</div>
          <div className="stat-card-label">Locations</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon yellow">
              <span>&#x1F6A7;</span>
            </div>
          </div>
          <h3>ATMs</h3>
          <div className="stat-card-value yellow">{stats.atms}</div>
          <div className="stat-card-label">Active machines</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon purple">
              <span>&#x2699;&#xFE0F;</span>
            </div>
          </div>
          <h3>Systems</h3>
          <div className="stat-card-value purple">{stats.systems}</div>
          <div className="stat-card-label">Running services</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">
            <span>&#x1F5A5;&#xFE0F;</span>
            IT Operations
          </h3>
        </div>
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="btn btn-primary" style={{ textAlign: 'center', cursor: 'pointer' }}>
            <span>&#x1F5A5;&#xFE0F;</span> System Status
          </div>
          <div className="btn btn-secondary" style={{ textAlign: 'center', cursor: 'pointer' }}>
            <span>&#x1F4BB;</span> Server Logs
          </div>
          <div className="btn btn-secondary" style={{ textAlign: 'center', cursor: 'pointer' }}>
            <span>&#x1F512;</span> User Access
          </div>
          <div className="btn btn-secondary" style={{ textAlign: 'center', cursor: 'pointer' }}>
            <span>&#x1F6E0;&#xFE0F;</span> Network Config
          </div>
        </div>
      </div>
    </div>
  );
};

export default ITDashboard;