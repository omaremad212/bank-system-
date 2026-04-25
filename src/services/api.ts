import axios from 'axios';

import { branches } from '../data/branches';
import { departments } from '../data/departments';
import { employees, managerDetails, tellerDetails, clerkDetails } from '../data/employees';
import { customers, customerPhones } from '../data/customers';
import { bankAccounts, savingsAccounts, checkingAccounts } from '../data/accounts';
import { transactions, atms } from '../data/transactions';
import { loanApplications } from '../data/loans';

const API_URL = '/api';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const calculateBalance = (accountId: number) => {
  return transactions
    .filter(t => t.AccountID === accountId)
    .reduce((sum, t) => sum + (t.TransactionType === 'Deposit' ? t.Amount : -t.Amount), 0);
};

const getAccountDetails = (accountId: number) => {
  const savings = savingsAccounts.find(s => s.AccountID === accountId);
  const checking = checkingAccounts.find(c => c.AccountID === accountId);
  if (savings) return { type: 'Savings', ...savings };
  if (checking) return { type: 'Checking', ...checking };
  return null;
};

const getBranchForDepartment = (departmentId: number) => {
  const dept = departments.find(d => d.DepartmentID === departmentId);
  if (!dept) return null;
  return branches.find(b => b.BranchID === dept.BranchID);
};

const getEmployeeRole = (employeeId: number) => {
  const manager = managerDetails.find(m => m.EmployeeID === employeeId);
  if (manager) return { roleType: 'Manager', ...manager };
  
  const teller = tellerDetails.find(t => t.EmployeeID === employeeId);
  if (teller) return { roleType: 'Teller', ...teller };
  
  const clerk = clerkDetails.find(c => c.EmployeeID === employeeId);
  if (clerk) return { roleType: 'Clerk', ...clerk };
  
  return { roleType: 'Employee' };
};

export const api = {
  login: {
    customer: async (nationalId: string, password: string) => {
      await delay(300);
      
      if (password !== '0000') {
        return { success: false, error: 'Invalid password' };
      }
      
      const customer = customers.find(c => c.NationalID === nationalId);
      if (!customer) {
        return { success: false, error: 'Invalid National ID' };
      }
      
      const phones = customerPhones.filter(p => p.CustomerID === customer.CustomerID).map(p => p.Phone);
      
      const token = btoa(JSON.stringify({ id: customer.CustomerID, type: 'customer' }));
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        id: customer.CustomerID,
        type: 'customer',
        name: `${customer.FirstName} ${customer.LastName}`,
        nationalId: customer.NationalID,
        firstName: customer.FirstName,
        lastName: customer.LastName,
        gender: customer.Gender,
        street: customer.Street,
        area: customer.Area,
        state: customer.State,
        dateOfBirth: customer.DateOfBirth,
        phones,
      }));
      
      return { 
        success: true, 
        user: {
          id: customer.CustomerID,
          type: 'customer',
          name: `${customer.FirstName} ${customer.LastName}`,
          nationalId: customer.NationalID,
          firstName: customer.FirstName,
          lastName: customer.LastName,
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
      await delay(300);
      
      if (password !== '0000') {
        return { success: false, error: 'Invalid password' };
      }
      
      const empId = parseInt(employeeId);
      const employee = employees.find(e => e.EmployeeID === empId);
      if (!employee) {
        return { success: false, error: 'Invalid Employee ID' };
      }
      
      const role = getEmployeeRole(empId);
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
        success: true, 
        user: {
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
        }
      };
    },
  },
  
  customer: {
    getProfile: async () => {
      await delay(200);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const customer = customers.find(c => c.CustomerID === user.id) || customers[0];
      const phones = customerPhones.filter(p => p.CustomerID === customer?.CustomerID).map(p => p.Phone);
      return { ...customer, phones };
    },
    getAccounts: async () => {
      await delay(300);
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
      await delay(200);
      return transactions.filter(t => t.AccountID === accountId);
    },
    deposit: async (accountId: number, amount: number) => {
      await delay(300);
      transactions.push({
        TransactionID: transactions.length + 1,
        Amount: amount,
        Date_Time: new Date().toISOString(),
        TransactionType: 'Deposit',
        AccountID: accountId,
        ATMID: 1
      });
      return { success: true, message: 'Deposit successful' };
    },
    withdraw: async (accountId: number, amount: number) => {
      await delay(300);
      const balance = calculateBalance(accountId);
      const account = bankAccounts.find(a => a.AccountID === accountId);
      const accountDetails = getAccountDetails(accountId);
      const maxWithdraw = balance + (accountDetails?.type === 'Checking' ? (accountDetails as any).OverdraftLimit || 0 : 0);
      
      if (amount > maxWithdraw) {
        return { success: false, error: 'Insufficient funds' };
      }
      
      transactions.push({
        TransactionID: transactions.length + 1,
        Amount: amount,
        Date_Time: new Date().toISOString(),
        TransactionType: 'Withdraw',
        AccountID: accountId,
        ATMID: 1
      });
      return { success: true, message: 'Withdrawal successful' };
    },
    transfer: async (fromAccountId: number, toAccountId: number, amount: number) => {
      await delay(300);
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
        TransactionID: transactions.length + 1,
        Amount: amount,
        Date_Time: new Date().toISOString(),
        TransactionType: 'Deposit',
        AccountID: toAccountId,
        ATMID: 1
      });
      return { success: true, message: 'Transfer successful' };
    },
    getLoans: async () => {
      await delay(200);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return loanApplications.filter(l => l.CustomerID === user.id);
    },
    createLoan: async (amount: number) => {
      await delay(300);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      loanApplications.push({
        ApplicationID: loanApplications.length + 1,
        AppDate: new Date().toISOString().split('T')[0],
        CustomerID: user.id,
        ApprovedAmt: amount,
      });
      return { success: true, message: 'Loan application submitted' };
    },
  },
  
  admin: {
    getCustomers: async () => {
      await delay(300);
      return customers.map(c => ({
        ...c,
        phones: customerPhones.filter(p => p.CustomerID === c.CustomerID).map(p => p.Phone),
      }));
    },
    getCustomerPhones: async () => {
      await delay(200);
      return customerPhones;
    },
    getAccounts: async () => {
      await delay(300);
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
    getSavingsAccounts: async () => {
      await delay(200);
      return savingsAccounts;
    },
    getCheckingAccounts: async () => {
      await delay(200);
      return checkingAccounts;
    },
    getEmployees: async () => {
      await delay(300);
      return employees.map(e => {
        const role = getEmployeeRole(e.EmployeeID);
        const dept = departments.find(d => d.DepartmentID === e.DepartmentID);
        return { ...e, ...role, departmentName: dept?.DepartmentName };
      });
    },
    getManagerDetails: async () => {
      await delay(200);
      return managerDetails.map(m => {
        const emp = employees.find(e => e.EmployeeID === m.EmployeeID);
        return { ...m, employeeName: emp ? `${emp.FirstName} ${emp.LastName}` : null };
      });
    },
    getTellerDetails: async () => {
      await delay(200);
      return tellerDetails.map(t => {
        const emp = employees.find(e => e.EmployeeID === t.EmployeeID);
        return { ...t, employeeName: emp ? `${emp.FirstName} ${emp.LastName}` : null };
      });
    },
    getClerkDetails: async () => {
      await delay(200);
      return clerkDetails.map(c => {
        const emp = employees.find(e => e.EmployeeID === c.EmployeeID);
        return { ...c, employeeName: emp ? `${emp.FirstName} ${emp.LastName}` : null };
      });
    },
    getBranches: async () => {
      await delay(200);
      return branches;
    },
    getDepartments: async () => {
      await delay(200);
      return departments.map(d => {
        const branch = branches.find(b => b.BranchID === d.BranchID);
        return { ...d, branchName: branch?.BranchName };
      });
    },
    getATMs: async () => {
      await delay(200);
      return atms.map(a => {
        const branch = branches.find(b => b.BranchID === a.BranchID);
        return { ...a, branchName: branch?.BranchName };
      });
    },
    getTransactions: async () => {
      await delay(300);
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
      await delay(300);
      return loanApplications.map(l => {
        const customer = customers.find(c => c.CustomerID === l.CustomerID);
        return { 
          ...l, 
          customerName: customer ? `${customer.FirstName} ${customer.LastName}` : null 
        };
      });
    },
    createAccount: async (customerId: number, accountType: string, branchId: number) => {
      await delay(300);
      const newId = bankAccounts.length + 1;
      bankAccounts.push({
        AccountID: newId,
        AccountNumber: `ACC-${1000 + newId}`,
        OpenDate: new Date().toISOString().split('T')[0],
        AccountType: accountType,
        CustomerID: customerId,
        BranchID: branchId,
      });
      if (accountType === 'Savings') {
        savingsAccounts.push({ AccountID: newId, InterestRate: 5.0 });
      } else {
        checkingAccounts.push({ AccountID: newId, OverdraftLimit: 1000 });
      }
      return { success: true, accountId: newId };
    },
  },
};