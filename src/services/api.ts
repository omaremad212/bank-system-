import axios from 'axios';

const API_URL = '/api';

const DEMO_CUSTOMERS = [
  { CustomerID: 1, NationalID: '29901011234567', FirstName: 'Mohamed', LastName: 'Youssef', Gender: 'Male', Street: '15 Nile St', Area: 'Dokki', State: 'Cairo', DateOfBirth: '1999-01-01', phones: ['01012345678', '01198765432'] },
  { CustomerID: 2, NationalID: '30005152345678', FirstName: 'Nour', LastName: 'Tarek', Gender: 'Female', Street: '22 Hassan St', Area: 'Sidi Gaber', State: 'Alexandria', DateOfBirth: '2000-05-15', phones: ['01223456789'] },
  { CustomerID: 3, NationalID: '29808203456789', FirstName: 'Bassem', LastName: 'Fathy', Gender: 'Male', Street: '8 Pyramids Rd', Area: 'Haram', State: 'Giza', DateOfBirth: '1998-08-20', phones: ['01534567890'] },
];

const DEMO_ACCOUNTS = [
  { AccountID: 1, AccountNumber: 'ACC-1001', OpenDate: '2020-01-10', AccountType: 'Savings', CustomerID: 1, BranchID: 1, InterestRate: 5.50 },
  { AccountID: 2, AccountNumber: 'ACC-1002', OpenDate: '2021-03-15', AccountType: 'Checking', CustomerID: 1, BranchID: 1, OverdraftLimit: 2000.00 },
  { AccountID: 3, AccountNumber: 'ACC-1003', OpenDate: '2019-07-20', AccountType: 'Savings', CustomerID: 2, BranchID: 2, InterestRate: 4.75 },
  { AccountID: 4, AccountNumber: 'ACC-1004', OpenDate: '2022-11-05', AccountType: 'Checking', CustomerID: 3, BranchID: 3, OverdraftLimit: 1500.00 },
];

const DEMO_TRANSACTIONS = [
  { TransactionID: 1, Amount: 5000, Date_Time: '2024-01-15T10:30:00', TransactionType: 'Deposit', AccountID: 1, ATMID: 1 },
  { TransactionID: 2, Amount: 1000, Date_Time: '2024-02-10T14:00:00', TransactionType: 'Withdraw', AccountID: 2, ATMID: 1 },
  { TransactionID: 3, Amount: 3000, Date_Time: '2024-03-05T09:15:00', TransactionType: 'Transfer', AccountID: 3, ATMID: 2 },
  { TransactionID: 4, Amount: 500, Date_Time: '2024-04-01T16:45:00', TransactionType: 'Deposit', AccountID: 4, ATMID: 3 },
];

const DEMO_LOANS = [
  { ApplicationID: 1, AppDate: '2023-06-01', StartDate: '2023-07-01', EndDate: '2026-07-01', ApprovedAmt: 50000, CustomerID: 1 },
  { ApplicationID: 2, AppDate: '2023-09-15', StartDate: '2023-10-01', EndDate: '2025-10-01', ApprovedAmt: 30000, CustomerID: 2 },
  { ApplicationID: 3, AppDate: '2024-01-10', StartDate: '2024-02-01', EndDate: '2027-02-01', ApprovedAmt: 70000, CustomerID: 3 },
];

const DEMO_EMPLOYEES = [
  { EmployeeID: 1, FirstName: 'Mohamed', LastName: 'Anwar', Gender: 'Male', Salary: 15000.00, DepartmentID: 1, jobTitle: 'Branch Manager' },
  { EmployeeID: 2, FirstName: 'Sara', LastName: 'Mohamed', Gender: 'Female', Salary: 12000.00, DepartmentID: 2, clerkLevel: 'Senior Clerk' },
  { EmployeeID: 3, FirstName: 'Mohamed', LastName: 'aqra', Gender: 'Male', Salary: 10000.00, DepartmentID: 3, branchLocation: 'Alexandria, Egypt', tellerID: 'TEL-001' },
  { EmployeeID: 4, FirstName: 'Mona', LastName: 'Khaled', Gender: 'Female', Salary: 11000.00, DepartmentID: 4, branchLocation: 'Giza, Egypt', tellerID: 'TEL-002' },
  { EmployeeID: 5, FirstName: 'Mohamed', LastName: 'ayman', Gender: 'Male', Salary: 13000.00, DepartmentID: 1, jobTitle: 'Department Manager' },
];

const DEMO_BRANCHES = [
  { BranchID: 1, BranchName: 'Cairo Main Branch', Location: 'Cairo, Egypt', Email: 'cairo@bank.com', EstablishedYear: 1990 },
  { BranchID: 2, BranchName: 'Alexandria Branch', Location: 'Alexandria, Egypt', Email: 'alex@bank.com', EstablishedYear: 1995 },
  { BranchID: 3, BranchName: 'Giza Branch', Location: 'Giza, Egypt', Email: 'giza@bank.com', EstablishedYear: 2000 },
];

const DEMO_DEPARTMENTS = [
  { DepartmentID: 1, DepartmentName: 'HR Department', BranchID: 1 },
  { DepartmentID: 2, DepartmentName: 'IT Department', BranchID: 1 },
  { DepartmentID: 3, DepartmentName: 'Operations', BranchID: 2 },
  { DepartmentID: 4, DepartmentName: 'Customer Service', BranchID: 3 },
];

const DEMO_ATMS = [
  { ATMID: 1, Location: 'Cairo Main Entrance', InstallDate: '2015-03-10', Status: 'Active', BranchID: 1 },
  { ATMID: 2, Location: 'Alexandria Mall', InstallDate: '2018-07-22', Status: 'Active', BranchID: 2 },
  { ATMID: 3, Location: 'Giza Square', InstallDate: '2020-01-15', Status: 'Offline', BranchID: 3 },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const calculateBalance = (accountId: number) => {
  return DEMO_TRANSACTIONS
    .filter(t => t.AccountID === accountId)
    .reduce((sum, t) => sum + (t.TransactionType === 'Deposit' ? t.Amount : -t.Amount), 0);
};

export const api = {
  login: {
    customer: async (nationalId: string, password: string) => {
      await delay(300);
      
      if (password !== '0000') {
        return { success: false, error: 'Invalid password' };
      }
      
      const customer = DEMO_CUSTOMERS.find(c => c.NationalID === nationalId);
      if (!customer) {
        return { success: false, error: 'Invalid National ID' };
      }
      
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
        phones: customer.phones,
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
          phones: customer.phones,
        }
      };
    },
    employee: async (employeeId: string, password: string) => {
      await delay(300);
      
      if (password !== '0000') {
        return { success: false, error: 'Invalid password' };
      }
      
      const empId = parseInt(employeeId);
      const employee = DEMO_EMPLOYEES.find(e => e.EmployeeID === empId);
      if (!employee) {
        return { success: false, error: 'Invalid Employee ID' };
      }
      
      const employeeDetails = DEMO_EMPLOYEES.find(e => e.EmployeeID === empId);
      let roleType = 'employee';
      let roleDetails = null;
      
      if (empId === 1 || empId === 5) {
        roleType = 'manager';
        roleDetails = { jobTitle: employeeDetails?.jobTitle };
      } else if (empId === 3 || empId === 4) {
        roleType = 'teller';
        roleDetails = { branchLocation: employeeDetails?.branchLocation, tellerID: employeeDetails?.tellerID };
      } else {
        roleType = 'clerk';
        roleDetails = { clerkLevel: employeeDetails?.clerkLevel };
      }
      
      const token = btoa(JSON.stringify({ id: employee.EmployeeID, type: 'employee', roleType }));
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        id: employee.EmployeeID,
        type: 'employee',
        roleType,
        name: `${employee.FirstName} ${employee.LastName}`,
        firstName: employee.FirstName,
        lastName: employee.LastName,
        gender: employee.Gender,
        salary: employee.Salary,
        departmentId: employee.DepartmentID,
        ...roleDetails,
      }));
      
      return { 
        success: true, 
        user: {
          id: employee.EmployeeID,
          type: 'employee',
          roleType,
          name: `${employee.FirstName} ${employee.LastName}`,
          firstName: employee.FirstName,
          lastName: employee.LastName,
          gender: employee.Gender,
          salary: employee.Salary,
          departmentId: employee.DepartmentID,
          ...roleDetails,
        }
      };
    },
  },
  
  customer: {
    getProfile: async () => {
      await delay(200);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const customer = DEMO_CUSTOMERS.find(c => c.CustomerID === user.id) || DEMO_CUSTOMERS[0];
      const phones = DEMO_CUSTOMERS.find(c => c.CustomerID === user.id)?.phones || [];
      return { ...customer, phones };
    },
    getAccounts: async () => {
      await delay(300);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const accounts = DEMO_ACCOUNTS.filter(a => a.CustomerID === user.id);
      return accounts.map(acc => {
        const isSavings = DEMO_ACCOUNTS.some(s => s.AccountID === acc.AccountID && s.InterestRate !== undefined);
        return {
          ...acc,
          AccountTypeName: acc.AccountType,
          balance: calculateBalance(acc.AccountID),
          additional_info: isSavings ? `Interest Rate: ${acc.InterestRate}%` : `Overdraft Limit: $${acc.OverdraftLimit}`,
        };
      });
    },
    getTransactions: async (accountId: number) => {
      await delay(200);
      return DEMO_TRANSACTIONS.filter(t => t.AccountID === accountId);
    },
    deposit: async (accountId: number, amount: number) => {
      await delay(300);
      DEMO_TRANSACTIONS.push({
        TransactionID: DEMO_TRANSACTIONS.length + 1,
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
      const account = DEMO_ACCOUNTS.find(a => a.AccountID === accountId);
      const maxWithdraw = balance + (account?.OverdraftLimit || 0);
      
      if (amount > maxWithdraw) {
        return { success: false, error: 'Insufficient funds' };
      }
      
      DEMO_TRANSACTIONS.push({
        TransactionID: DEMO_TRANSACTIONS.length + 1,
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
      const account = DEMO_ACCOUNTS.find(a => a.AccountID === fromAccountId);
      const maxWithdraw = balance + (account?.OverdraftLimit || 0);
      
      if (amount > maxWithdraw) {
        return { success: false, error: 'Insufficient funds' };
      }
      
      DEMO_TRANSACTIONS.push({
        TransactionID: DEMO_TRANSACTIONS.length + 1,
        Amount: amount,
        Date_Time: new Date().toISOString(),
        TransactionType: 'Withdraw',
        AccountID: fromAccountId,
        ATMID: 1
      });
      DEMO_TRANSACTIONS.push({
        TransactionID: DEMO_TRANSACTIONS.length + 1,
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
      const loans = DEMO_LOANS.filter(l => l.CustomerID === user.id);
      return loans.map(loan => ({
        ...loan,
        status: loan.ApprovedAmt ? 'Approved' : 'Pending'
      }));
    },
    createLoan: async (amount: number) => {
      await delay(300);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      DEMO_LOANS.push({
        ApplicationID: DEMO_LOANS.length + 1,
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
      return DEMO_CUSTOMERS.map(c => ({
        ...c,
        phones: c.phones,
      }));
    },
    getAccounts: async () => {
      await delay(300);
      return DEMO_ACCOUNTS.map(acc => {
        const isSavings = acc.InterestRate !== undefined;
        return {
          ...acc,
          AccountTypeName: acc.AccountType,
          balance: calculateBalance(acc.AccountID),
          additional_info: isSavings ? `Interest Rate: ${acc.InterestRate}%` : `Overdraft Limit: $${acc.OverdraftLimit}`,
        };
      });
    },
    getEmployees: async () => {
      await delay(300);
      return DEMO_EMPLOYEES.map(e => {
        let roleType = 'employee';
        if (e.EmployeeID === 1 || e.EmployeeID === 5) roleType = 'manager';
        else if (e.EmployeeID === 3 || e.EmployeeID === 4) roleType = 'teller';
        else roleType = 'clerk';
        return { ...e, roleType };
      });
    },
    getBranches: async () => {
      await delay(200);
      return DEMO_BRANCHES;
    },
    getDepartments: async () => {
      await delay(200);
      return DEMO_DEPARTMENTS;
    },
    getATMs: async () => {
      await delay(200);
      return DEMO_ATMS;
    },
    getTransactions: async () => {
      await delay(300);
      return DEMO_TRANSACTIONS;
    },
    getLoans: async () => {
      await delay(300);
      return DEMO_LOANS.map(loan => ({
        ...loan,
        status: loan.ApprovedAmt ? 'Approved' : 'Pending'
      }));
    },
    createAccount: async (customerId: number, accountType: string, branchId: number) => {
      await delay(300);
      const newId = DEMO_ACCOUNTS.length + 1;
      DEMO_ACCOUNTS.push({
        AccountID: newId,
        AccountNumber: `ACC-${1000 + newId}`,
        OpenDate: new Date().toISOString().split('T')[0],
        AccountType: accountType,
        CustomerID: customerId,
        BranchID: branchId,
        ...(accountType === 'Savings' ? { InterestRate: 5.0 } : { OverdraftLimit: 1000 }),
      });
      return { success: true, accountId: newId };
    },
  },
};