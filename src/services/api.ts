import { customers, customerPhones } from '../data/customers';
import { employees, managerDetails, tellerDetails, clerkDetails } from '../data/employees';
import { departments } from '../data/departments';
import { branches } from '../data/branches';

const getEmployeeRole = (employeeId: number) => {
  const manager = managerDetails.find(m => m.EmployeeID === employeeId);
  if (manager) return { roleType: 'Manager', ...manager };
  
  const teller = tellerDetails.find(t => t.EmployeeID === employeeId);
  if (teller) return { roleType: 'Teller', ...teller };
  
  const clerk = clerkDetails.find(c => c.EmployeeID === employeeId);
  if (clerk) return { roleType: 'Clerk', ...clerk };
  
  return { roleType: 'Employee' };
};

const api = {
  login: {
    customer: async (nationalId: string, password: string) => {
      console.log('Customer login attempt:', { nationalId, password });
      
      const inputId = String(nationalId).trim();
      
      const customer = customers.find(c => String(c.NationalID) === inputId);
      
      if (!customer) {
        console.log('Customer not found:', inputId, 'Available IDs:', customers.map(c => c.NationalID));
        return { error: 'Invalid credentials' };
      }
      
      console.log('Customer found:', customer.FirstName, customer.LastName);
      
      if (password !== '0000') {
        console.log('Invalid password for customer:', customer.CustomerID);
        return { error: 'Invalid credentials' };
      }
      
      console.log('Login successful for customer:', customer.CustomerID);
      
      const phones = customerPhones
        .filter(p => p.CustomerID === customer.CustomerID)
        .map(p => p.Phone);
      
      const token = btoa(JSON.stringify({ id: customer.CustomerID, type: 'customer' }));
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        id: customer.CustomerID,
        type: 'customer',
        name: `${customer.FirstName} ${customer.LastName}`,
        firstName: customer.FirstName,
        lastName: customer.LastName,
        nationalId: customer.NationalID,
        gender: customer.Gender,
        street: customer.Street,
        area: customer.Area,
        state: customer.State,
        dateOfBirth: customer.DateOfBirth,
        phones,
      }));
      
      return {
        token,
        user: {
          id: customer.CustomerID,
          type: 'customer' as const,
          name: `${customer.FirstName} ${customer.LastName}`,
          firstName: customer.FirstName,
          lastName: customer.LastName,
          nationalId: customer.NationalID,
          gender: customer.Gender,
          street: customer.Street,
          area: customer.Area,
          state: customer.State,
          dateOfBirth: customer.DateOfBirth,
          phones,
        }
      };
    },
    
    employee: async (employeeId: string, password: string) => {
      console.log('Employee login attempt:', { employeeId, password });
      
      const inputId = String(employeeId).trim();
      const empIdNum = parseInt(inputId);
      
      if (isNaN(empIdNum)) {
        console.log('Invalid employee ID format:', inputId);
        return { error: 'Invalid credentials' };
      }
      
      const employee = employees.find(e => String(e.EmployeeID) === inputId);
      
      if (!employee) {
        console.log('Employee not found:', inputId, 'Available IDs:', employees.map(e => e.EmployeeID));
        return { error: 'Invalid credentials' };
      }
      
      console.log('Employee found:', employee.FirstName, employee.LastName);
      
      if (password !== '0000') {
        console.log('Invalid password for employee:', employee.EmployeeID);
        return { error: 'Invalid credentials' };
      }
      
      console.log('Login successful for employee:', employee.EmployeeID);
      
      const role = getEmployeeRole(employee.EmployeeID);
      const dept = departments.find(d => d.DepartmentID === employee.DepartmentID);
      const branch = dept ? branches.find(b => b.BranchID === dept.BranchID) : null;
      
      const token = btoa(JSON.stringify({ id: employee.EmployeeID, type: 'employee' }));
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        id: employee.EmployeeID,
        type: 'employee',
        name: `${employee.FirstName} ${employee.LastName}`,
        firstName: employee.FirstName,
        lastName: employee.LastName,
        gender: employee.Gender,
        salary: employee.Salary,
        departmentId: employee.DepartmentID,
        departmentName: dept?.DepartmentName,
        branchId: branch?.BranchID,
        branchName: branch?.BranchName,
        ...role,
      }));
      
      return {
        token,
        user: {
          id: employee.EmployeeID,
          type: 'employee' as const,
          name: `${employee.FirstName} ${employee.LastName}`,
          firstName: employee.FirstName,
          lastName: employee.LastName,
          gender: employee.Gender,
          salary: employee.Salary,
          departmentId: employee.DepartmentID,
          departmentName: dept?.DepartmentName,
          branchId: branch?.BranchID,
          branchName: branch?.BranchName,
          ...role,
        }
      };
    },
  },
};

export { api };
export default api;