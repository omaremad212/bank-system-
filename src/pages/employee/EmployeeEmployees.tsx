import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Employee, Department } from '../../types';

const EmployeeEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empData, deptData] = await Promise.all([
          api.admin.getEmployees(),
          api.admin.getDepartments(),
        ]);
        setEmployees(empData);
        setDepartments(deptData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDepartmentName = (departmentId: number) => {
    return departments.find((d: any) => d.departmentid === departmentId)?.departmentname || '-';
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
      <div className="welcome-hero">
        <div>
          <h1>Employees</h1>
          <p>Manage employee records</p>
        </div>
      </div>

      <div className="table-card">
        {employees.length === 0 ? (
          <div className="empty-state">
            <p>No employees found</p>
          </div>
) : (
          <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Department</th>
                  <th>Salary</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee: any) => (
                  <tr key={employee.employeeid}>
                    <td>{employee.employeeid}</td>
                    <td>
                      {employee.firstname && employee.lastname ? `${employee.firstname} ${employee.lastname}` : '-'}
                    </td>
                    <td>{employee.gender || '-'}</td>
                    <td>{getDepartmentName(employee.departmentid)}</td>
                    <td>${(employee.salary || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
</table>
        )}
      </div>
    </div>
  );
};

export default EmployeeEmployees;
