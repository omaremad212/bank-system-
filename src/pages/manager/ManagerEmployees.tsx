import { useState, useEffect } from 'react';
import api from '../../services/api';

const ManagerEmployees = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male',
    email: '',
    password: '',
    salary: 5000,
    departmentId: 1,
    roleType: 'Employee',
  });

  const fetchData = async () => {
    try {
      const [employeesData, departmentsData] = await Promise.all([
        api.admin.getEmployees(),
        api.admin.getDepartments(),
      ]);
      setEmployees(employeesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error fetching employees:', error);
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
      if (editingEmployee) {
        await api.admin.updateEmployee(editingEmployee.employeeid, formData);
      } else {
        await api.admin.createEmployee(formData);
      }
      setShowModal(false);
      setEditingEmployee(null);
      fetchData();
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstname,
      lastName: employee.lastname,
      gender: employee.gender,
      email: employee.email || '',
      password: '',
      salary: employee.salary,
      departmentId: employee.departmentid,
      roleType: employee.roleType || 'Employee',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.admin.deleteEmployee(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting employee:', error);
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
          <h2 style={{ color: '#1a365d', marginBottom: '0.5rem' }}>Employee Management</h2>
          <p style={{ color: '#718096' }}>Manage all employee records</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingEmployee(null);
            setFormData({
              firstName: '',
              lastName: '',
              gender: 'Male',
              email: '',
              password: '',
              salary: 5000,
              departmentId: 1,
              roleType: 'Employee',
            });
            setShowModal(true);
          }}
        >
          <span>+</span> Add Employee
        </button>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Gender</th>
              <th>Salary</th>
              <th>Role</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee: any) => (
              <tr key={employee.employeeid}>
                <td>{employee.employeeid}</td>
                <td>{employee.firstname && employee.lastname ? `${employee.firstname} ${employee.lastname}` : '-'}</td>
                <td>{employee.gender || '-'}</td>
                <td>${(employee.salary || 0).toLocaleString()}</td>
                <td>{employee.roleType || '-'}</td>
                <td>{employee.departmentname || '-'}</td>
                <td>
                  <button className="btn btn-sm btn-primary" onClick={() => handleEdit(employee)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(employee.employeeid)} style={{ marginLeft: '0.5rem' }}>Delete</button>
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
              <h3>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
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
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Salary</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.salary}
                      onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  {!editingEmployee && (
                    <div>
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-input"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required={!editingEmployee}
                      />
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <label className="form-label">Department</label>
                    <select
                      className="form-select"
                      value={formData.departmentId}
                      onChange={e => setFormData({ ...formData, departmentId: Number(e.target.value) })}
                    >
                      {departments.map((d: any) => (
                        <option key={d.departmentid || d.id} value={d.departmentid || d.id}>{d.departmentname || '-'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Role Type</label>
                    <select
                      className="form-select"
                      value={formData.roleType}
                      onChange={e => setFormData({ ...formData, roleType: e.target.value })}
                    >
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                      <option value="Teller">Teller</option>
                      <option value="Clerk">Clerk</option>
                      <option value="IT">IT</option>
                      <option value="HR">HR</option>
                      <option value="Customer Service">Customer Service</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingEmployee ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerEmployees;