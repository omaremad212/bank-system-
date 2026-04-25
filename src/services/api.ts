import { customers, customerPhones } from '../data/customers';
import { employees, managerDetails, tellerDetails, clerkDetails } from '../data/employees';
import { departments } from '../data/departments';
import { branches } from '../data/branches';
import { bankAccounts, savingsAccounts, checkingAccounts } from '../data/accounts';
import { transactions, atms } from '../data/transactions';
import { loanApplications } from '../data/loans';

const getEmployeeRole = (employeeId: number) => {
  const manager = managerDetails.find(m => m.EmployeeID === employeeId);
  if (manager) return { roleType: 'Manager', ...manager };
  const teller = tellerDetails.find(t => t.EmployeeID === employeeId);
  if (teller) return { roleType: 'Teller', ...teller };
  const clerk = clerkDetails.find(c => c.EmployeeID === employeeId);
  if (clerk) return { roleType: 'Clerk', ...clerk };
  return { roleType: 'Employee' };
};

const getAccountDetails = (accountId: number) => {
  const savings = savingsAccounts.find(s => s.AccountID === accountId);
  if (savings) return { type: 'Savings', ...savings };
  const checking = checkingAccounts.find(c => c.AccountID === accountId);
  if (checking) return { type: 'Checking', ...checking };
  return null;
};

const calculateBalance = (accountId: number) => {
  return transactions
    .filter(t => t.AccountID === accountId)
    .reduce((sum, t) => sum + (t.TransactionType === 'Deposit' ? t.Amount : -t.Amount), 0);
};

const api = {
  login: {
    customer: async (nationalId: string, password: string) => {
      const inputId = String(nationalId).trim();
      const customer = customers.find(c => String(c.NationalID) === inputId);
      
      if (!customer) {
        return { error: 'Invalid credentials' };
      }
      
      if (password !== '0000') {
        return { error: 'Invalid credentials' };
      }
      
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
      const inputId = String(employeeId).trim();
      const employee = employees.find(e => String(e.EmployeeID) === inputId);
      
      if (!employee) {
        return { error: 'Invalid credentials' };
      }
      
      if (password !== '0000') {
        return { error: 'Invalid credentials' };
      }
      
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
  
  customer: {
    getProfile: async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const customer = customers.find(c => c.CustomerID === user.id) || customers[0];
      const phones = customerPhones
        .filter(p => p.CustomerID === customer?.CustomerID)
        .map(p => p.Phone);
      return { ...customer, phones };
    },
    getAccounts: async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const accounts = bankAccounts.filter(a => a.CustomerID === user.id);
      return accounts.map(acc => {
        const accountDetails = getAccountDetails(acc.AccountID);
        const branch = branches.find(b => b.BranchID === acc.BranchID);
        return {
          ...acc,
          ...accountDetails,
          balance: calculateBalance(acc.AccountID),
          branchName: branch?.BranchName,
          branchLocation: branch?.Location,
        };
      });
    },
    getTransactions: async (accountId: number) => {
      return transactions.filter(t => t.AccountID === accountId);
    },
    deposit: async (accountId: number, amount: number) => {
      const newTransaction = {
        TransactionID: transactions.length + 1,
        Amount: amount,
        Date_Time: new Date().toISOString(),
        TransactionType: 'Deposit',
        AccountID: accountId,
        ATMID: 1
      };
      transactions.push(newTransaction);
      return { success: true, message: 'Deposit successful' };
    },
    withdraw: async (accountId: number, amount: number) => {
      const balance = calculateBalance(accountId);
      const accountDetails = getAccountDetails(accountId);
      const maxWithdraw = balance + (accountDetails?.type === 'Checking' ? (accountDetails as any).OverdraftLimit || 0 : 0);
      
      if (amount > maxWithdraw) {
        return { success: false, error: 'Insufficient funds' };
      }
      
      const newTransaction = {
        TransactionID: transactions.length + 1,
        Amount: amount,
        Date_Time: new Date().toISOString(),
        TransactionType: 'Withdraw',
        AccountID: accountId,
        ATMID: 1
      };
      transactions.push(newTransaction);
      return { success: true, message: 'Withdrawal successful' };
    },
    transfer: async (fromAccountId: number, toAccountId: number, amount: number) => {
      const balance = calculateBalance(fromAccountId);
      const accountDetails = getAccountDetails(fromAccountId);
      const maxWithdraw = balance + (accountDetails?.type === 'Checking' ? (accountDetails as any).OverdraftLimit || 0 : 0);
      
      if (amount > maxWithdraw) {
        return { success: false, error: 'Insufficient funds' };
      }
      
      transactions.push({
        TransactionID: transactions.length + 1,
        Amount: amount,
        Date_Time: new Date().toISOString(),
        TransactionType: 'Withdraw',
        AccountID: fromAccountId,
        ATMID: 1
      });
      transactions.push({
        TransactionID: transactions.length + 2,
        Amount: amount,
        Date_Time: new Date().toISOString(),
        TransactionType: 'Deposit',
        AccountID: toAccountId,
        ATMID: 1
      });
      return { success: true, message: 'Transfer successful' };
    },
    getLoans: async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return loanApplications.filter(l => l.CustomerID === user.id);
    },
    createLoan: async (amount: number) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      loanApplications.push({
        ApplicationID: loanApplications.length + 1,
        AppDate: new Date().toISOString().split('T')[0],
        StartDate: null,
        EndDate: null,
        ApprovedAmt: null,
        Status: 'Pending',
        CustomerID: user.id,
      });
      return { success: true, message: 'Loan application submitted' };
    },
  },
  
  admin: {
    getCustomers: async () => {
      return customers.map(c => ({
        ...c,
        phones: customerPhones.filter(p => p.CustomerID === c.CustomerID).map(p => p.Phone),
      }));
    },
    getAccounts: async () => {
      return bankAccounts.map(acc => {
        const accountDetails = getAccountDetails(acc.AccountID);
        const branch = branches.find(b => b.BranchID === acc.BranchID);
        const customer = customers.find(c => c.CustomerID === acc.CustomerID);
        return {
          ...acc,
          ...accountDetails,
          balance: calculateBalance(acc.AccountID),
          branchName: branch?.BranchName,
          customerName: customer ? `${customer.FirstName} ${customer.LastName}` : null,
        };
      });
    },
    getEmployees: async () => {
      return employees.map(e => {
        const role = getEmployeeRole(e.EmployeeID);
        const dept = departments.find(d => d.DepartmentID === e.DepartmentID);
        return { ...e, ...role, departmentName: dept?.DepartmentName };
      });
    },
    getBranches: async () => {
      return branches;
    },
    getDepartments: async () => {
      return departments.map(d => {
        const branch = branches.find(b => b.BranchID === d.BranchID);
        return { ...d, branchName: branch?.BranchName };
      });
    },
    getATMs: async () => {
      return atms.map(a => {
        const branch = branches.find(b => b.BranchID === a.BranchID);
        return { ...a, branchName: branch?.BranchName };
      });
    },
    getTransactions: async () => {
      return transactions.map(t => {
        const account = bankAccounts.find(a => a.AccountID === t.AccountID);
        const atm = atms.find(a => a.ATMID === t.ATMID);
        return {
          ...t,
          accountNumber: account?.AccountNumber,
          atmLocation: atm?.Location
        };
      });
    },
    getLoans: async () => {
      return loanApplications.map(l => {
        const customer = customers.find(c => c.CustomerID === l.CustomerID);
        return {
          ...l,
          customerName: customer ? `${customer.FirstName} ${customer.LastName}` : null,
        };
      });
    },
    getSavingsAccounts: async () => {
      return savingsAccounts;
    },
    getCheckingAccounts: async () => {
      return checkingAccounts;
    },
    getManagerDetails: async () => {
      return managerDetails.map(m => {
        const emp = employees.find(e => e.EmployeeID === m.EmployeeID);
        return { ...m, employeeName: emp ? `${emp.FirstName} ${emp.LastName}` : null };
      });
    },
    getTellerDetails: async () => {
      return tellerDetails.map(t => {
        const emp = employees.find(e => e.EmployeeID === t.EmployeeID);
        return { ...t, employeeName: emp ? `${emp.FirstName} ${emp.LastName}` : null };
      });
    },
    getClerkDetails: async () => {
      return clerkDetails.map(c => {
        const emp = employees.find(e => e.EmployeeID === c.EmployeeID);
        return { ...c, employeeName: emp ? `${emp.FirstName} ${emp.LastName}` : null };
      });
    },
  },
};

export { api };
export default api;