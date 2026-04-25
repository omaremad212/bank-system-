import { customers as customersData, customerPhones as customerPhonesData } from '../data/customers';
import { employees as employeesData, managerDetails, tellerDetails, clerkDetails } from '../data/employees';
import { departments as departmentsData } from '../data/departments';
import { branches as branchesData } from '../data/branches';
import { bankAccounts as bankAccountsData, savingsAccounts as savingsAccountsData, checkingAccounts as checkingAccountsData } from '../data/accounts';
import { transactions as transactionsData, atms as atmsData } from '../data/transactions';
import { loanApplications as loanApplicationsData } from '../data/loans';

let customers = [...customersData];
let customerPhones = [...customerPhonesData];
let employees = [...employeesData];
let departments = [...departmentsData];
let branches = [...branchesData];
let bankAccounts = [...bankAccountsData];
let savingsAccounts = [...savingsAccountsData];
let checkingAccounts = [...checkingAccountsData];
let transactions = [...transactionsData];
let atms = [...atmsData];
let loanApplications = [...loanApplicationsData];

const getEmployeeRole = (employeeId: number) => {
  const manager = managerDetails.find(m => m.EmployeeID === employeeId);
  if (manager) return { roleType: 'Manager', ...manager };
  const teller = tellerDetails.find(t => t.EmployeeID === employeeId);
  if (teller) return { roleType: 'Teller', ...teller };
  const clerk = clerkDetails.find(c => c.EmployeeID === employeeId);
  if (clerk) return { roleType: 'Clerk', ...clerk };
  
  const dept = departments.find(d => d.DepartmentID === employees.find(e => e.EmployeeID === employeeId)?.DepartmentID);
  if (dept?.DepartmentName === 'IT') return { roleType: 'IT' };
  if (dept?.DepartmentName === 'Customer Service') return { roleType: 'Customer Service' };
  if (dept?.DepartmentName === 'HR') return { roleType: 'HR' };
  
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
        Date_Time: new Date().toISOString().replace('T', ' ').split('.')[0],
        TransactionType: 'Deposit',
        AccountID: accountId,
        ATMID: 1
      };
      transactions.push(newTransaction);
      return { success: true, message: 'Deposit successful', transaction: newTransaction };
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
        Date_Time: new Date().toISOString().replace('T', ' ').split('.')[0],
        TransactionType: 'Withdraw',
        AccountID: accountId,
        ATMID: 1
      };
      transactions.push(newTransaction);
      return { success: true, message: 'Withdrawal successful', transaction: newTransaction };
    },
    transfer: async (fromAccountId: number, toAccountId: number, amount: number) => {
      const balance = calculateBalance(fromAccountId);
      const accountDetails = getAccountDetails(fromAccountId);
      const maxWithdraw = balance + (accountDetails?.type === 'Checking' ? (accountDetails as any).OverdraftLimit || 0 : 0);
      
      if (amount > maxWithdraw) {
        return { success: false, error: 'Insufficient funds' };
      }
      
      const withdrawTx = {
        TransactionID: transactions.length + 1,
        Amount: amount,
        Date_Time: new Date().toISOString().replace('T', ' ').split('.')[0],
        TransactionType: 'Withdraw',
        AccountID: fromAccountId,
        ATMID: 1
      };
      const depositTx = {
        TransactionID: transactions.length + 2,
        Amount: amount,
        Date_Time: new Date().toISOString().replace('T', ' ').split('.')[0],
        TransactionType: 'Deposit',
        AccountID: toAccountId,
        ATMID: 1
      };
      transactions.push(withdrawTx, depositTx);
      return { success: true, message: 'Transfer completed successfully' };
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
      return { success: true, message: 'Loan application submitted successfully' };
    },
  },
  
  admin: {
    getCustomers: async () => {
      return customers.map(c => ({
        ...c,
        phones: customerPhones.filter(p => p.CustomerID === c.CustomerID).map(p => p.Phone),
      }));
    },
    createCustomer: async (data: any) => {
      const newCustomer = {
        CustomerID: customers.length + 1,
        NationalID: data.nationalId,
        FirstName: data.firstName,
        LastName: data.lastName,
        Gender: data.gender,
        Street: data.street,
        Area: data.area,
        State: data.state,
        DateOfBirth: data.dateOfBirth,
      };
      customers.push(newCustomer);
      
      if (data.phones && data.phones.length > 0) {
        for (const phone of data.phones) {
          customerPhones.push({
            CustomerID: newCustomer.CustomerID,
            Phone: phone
          });
        }
      }
      
      return { success: true, customerId: newCustomer.CustomerID, message: 'Customer created successfully' };
    },
    updateCustomer: async (id: number, data: any) => {
      const index = customers.findIndex(c => c.CustomerID === id);
      if (index >= 0) {
        customers[index] = { ...customers[index], ...data };
      }
      
      if (data.phones) {
        const existingPhones = customerPhones.filter(p => p.CustomerID === id);
        existingPhones.forEach(p => {
          const idx = customerPhones.findIndex(cp => cp.CustomerID === id && cp.Phone === p.Phone);
          if (idx >= 0) customerPhones.splice(idx, 1);
        });
        for (const phone of data.phones) {
          customerPhones.push({ CustomerID: id, Phone: phone });
        }
      }
      
      return { success: true, message: 'Customer updated successfully' };
    },
    deleteCustomer: async (id: number) => {
      customerPhones = customerPhones.filter(p => p.CustomerID !== id);
      loanApplications = loanApplications.filter(l => l.CustomerID !== id);
      bankAccounts = bankAccounts.filter(a => a.CustomerID !== id);
      customers = customers.filter(c => c.CustomerID !== id);
      return { success: true, message: 'Customer deleted successfully' };
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
    createAccount: async (data: any) => {
      const newAccount = {
        AccountID: bankAccounts.length + 1,
        AccountNumber: `ACC-${1000 + bankAccounts.length + 1}`,
        OpenDate: new Date().toISOString().split('T')[0],
        AccountType: data.accountType,
        CustomerID: data.customerId,
        BranchID: data.branchId || 1,
      };
      bankAccounts.push(newAccount);
      
      if (data.accountType === 'Savings') {
        savingsAccounts.push({
          AccountID: newAccount.AccountID,
          InterestRate: data.interestRate || 5.0
        });
      } else {
        checkingAccounts.push({
          AccountID: newAccount.AccountID,
          OverdraftLimit: data.overdraftLimit || 1000
        });
      }
      
      return { success: true, accountId: newAccount.AccountID, message: 'Account created successfully' };
    },
    deleteAccount: async (id: number) => {
      transactions = transactions.filter(t => t.AccountID !== id);
      savingsAccounts = savingsAccounts.filter(s => s.AccountID !== id);
      checkingAccounts = checkingAccounts.filter(c => c.AccountID !== id);
      bankAccounts = bankAccounts.filter(a => a.AccountID !== id);
      return { success: true, message: 'Account deleted successfully' };
    },
    getEmployees: async () => {
      return employees.map(e => {
        const role = getEmployeeRole(e.EmployeeID);
        const dept = departments.find(d => d.DepartmentID === e.DepartmentID);
        return { ...e, ...role, departmentName: dept?.DepartmentName };
      });
    },
    createEmployee: async (data: any) => {
      const newEmployee = {
        EmployeeID: employees.length + 1,
        FirstName: data.firstName,
        LastName: data.lastName,
        Gender: data.gender,
        Salary: data.salary,
        DepartmentID: data.departmentId,
      };
      employees.push(newEmployee);
      
      if (data.roleType === 'Manager') {
        managerDetails.push({ EmployeeID: newEmployee.EmployeeID, JobTitle: data.jobTitle || 'Manager' });
      } else if (data.roleType === 'Teller') {
        tellerDetails.push({ EmployeeID: newEmployee.EmployeeID, BranchLocation: data.branchLocation, TellerID: `TEL-${newEmployee.EmployeeID}` });
      } else if (data.roleType === 'Clerk') {
        clerkDetails.push({ EmployeeID: newEmployee.EmployeeID, ClerkLevel: data.clerkLevel || 'Clerk' });
      }
      
      return { success: true, employeeId: newEmployee.EmployeeID, message: 'Employee created successfully' };
    },
    updateEmployee: async (id: number, data: any) => {
      const index = employees.findIndex(e => e.EmployeeID === id);
      if (index >= 0) {
        employees[index] = { ...employees[index], ...data };
      }
      return { success: true, message: 'Employee updated successfully' };
    },
    deleteEmployee: async (id: number) => {
      employees = employees.filter(e => e.EmployeeID !== id);
      return { success: true, message: 'Employee deleted successfully' };
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
    createATM: async (data: any) => {
      const newATM = {
        ATMID: atms.length + 1,
        Location: data.location,
        InstallDate: new Date().toISOString().split('T')[0],
        Status: data.status || 'Active',
        BranchID: data.branchId || 1,
      };
      atms.push(newATM);
      return { success: true, atmId: newATM.ATMID, message: 'ATM created successfully' };
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
    createTransaction: async (data: any) => {
      const newTx = {
        TransactionID: transactions.length + 1,
        Amount: data.amount,
        Date_Time: new Date().toISOString().replace('T', ' ').split('.')[0],
        TransactionType: data.transactionType,
        AccountID: data.accountId,
        ATMID: data.atmId || 1,
      };
      transactions.push(newTx);
      return { success: true, transactionId: newTx.TransactionID, message: 'Transaction created successfully' };
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
    updateLoan: async (id: number, data: any) => {
      const index = loanApplications.findIndex(l => l.ApplicationID === id);
      if (index >= 0) {
        loanApplications[index] = { ...loanApplications[index], ...data };
      }
      return { success: true, message: 'Loan updated successfully' };
    },
    createLoan: async (data: any) => {
      const newLoan = {
        ApplicationID: loanApplications.length + 1,
        AppDate: new Date().toISOString().split('T')[0],
        StartDate: data.startDate,
        EndDate: data.endDate,
        ApprovedAmt: data.approvedAmt,
        Status: data.status || 'Pending',
        CustomerID: data.customerId,
      };
      loanApplications.push(newLoan);
      return { success: true, applicationId: newLoan.ApplicationID, message: 'Loan created successfully' };
    },
  },
};

export { api };
export default api;