import { Customer, BankAccount, Transaction, LoanApplication, Employee, Branch, Department, ATM } from '../types';

const mockCustomers: Customer[] = [
  {
    CustomerID: 1,
    NationalID: '29901011234567',
    FirstName: 'Mohamed',
    LastName: 'Youssef',
    Gender: 'Male',
    Street: '15 Nile St',
    Area: 'Dokki',
    State: 'Cairo',
    DateOfBirth: '1999-01-01',
    phones: ['01012345678', '01198765432']
  },
  {
    CustomerID: 2,
    NationalID: '30005152345678',
    FirstName: 'Nour',
    LastName: 'Tarek',
    Gender: 'Female',
    Street: '22 Hassan St',
    Area: 'Sidi Gaber',
    State: 'Alexandria',
    DateOfBirth: '2000-05-15',
    phones: ['01223456789']
  },
  {
    CustomerID: 3,
    NationalID: '29808203456789',
    FirstName: 'Bassem',
    LastName: 'Fathy',
    Gender: 'Male',
    Street: '8 Pyramids Rd',
    Area: 'Haram',
    State: 'Giza',
    DateOfBirth: '1998-08-20',
    phones: ['01534567890']
  }
];

const mockAccounts: BankAccount[] = [
  {
    AccountID: 1,
    AccountNumber: 'ACC-1001',
    OpenDate: '2020-01-10',
    AccountType: 'Savings',
    CustomerID: 1,
    BranchID: 1,
    balance: 5000,
    interestRate: 5.5
  },
  {
    AccountID: 2,
    AccountNumber: 'ACC-1002',
    OpenDate: '2021-03-15',
    AccountType: 'Checking',
    CustomerID: 1,
    BranchID: 1,
    balance: 2000,
    overdraftLimit: 2000
  },
  {
    AccountID: 3,
    AccountNumber: 'ACC-1003',
    OpenDate: '2019-07-20',
    AccountType: 'Savings',
    CustomerID: 2,
    BranchID: 2,
    balance: 3000,
    interestRate: 4.75
  },
  {
    AccountID: 4,
    AccountNumber: 'ACC-1004',
    OpenDate: '2022-11-05',
    AccountType: 'Checking',
    CustomerID: 3,
    BranchID: 3,
    balance: 500,
    overdraftLimit: 1500
  }
];

const mockTransactions: Transaction[] = [
  {
    TransactionID: 1,
    Amount: 5000,
    Date_Time: '2024-01-15T10:30:00',
    TransactionType: 'Deposit',
    AccountID: 1,
    ATMID: 1
  },
  {
    TransactionID: 2,
    Amount: 1000,
    Date_Time: '2024-02-10T14:00:00',
    TransactionType: 'Withdraw',
    AccountID: 2,
    ATMID: 1
  },
  {
    TransactionID: 3,
    Amount: 3000,
    Date_Time: '2024-03-05T09:15:00',
    TransactionType: 'Transfer',
    AccountID: 3,
    ATMID: 2
  },
  {
    TransactionID: 4,
    Amount: 500,
    Date_Time: '2024-04-01T16:45:00',
    TransactionType: 'Deposit',
    AccountID: 4,
    ATMID: 3
  }
];

const mockLoanApplications: LoanApplication[] = [
  {
    ApplicationID: 1,
    AppDate: '2023-06-01',
    StartDate: '2023-07-01',
    EndDate: '2026-07-01',
    ApprovedAmt: 50000,
    CustomerID: 1,
    status: 'Approved'
  },
  {
    ApplicationID: 2,
    AppDate: '2023-09-15',
    StartDate: '2023-10-01',
    EndDate: '2025-10-01',
    ApprovedAmt: 30000,
    CustomerID: 2,
    status: 'Approved'
  },
  {
    ApplicationID: 3,
    AppDate: '2024-01-10',
    StartDate: '2024-02-01',
    EndDate: '2027-02-01',
    ApprovedAmt: 70000,
    CustomerID: 3,
    status: 'Approved'
  }
];

const mockEmployees: Employee[] = [
  {
    EmployeeID: 1,
    FirstName: 'Mohamed',
    LastName: 'Anwar',
    Gender: 'Male',
    Salary: 15000,
    DepartmentID: 1
  },
  {
    EmployeeID: 2,
    FirstName: 'Sara',
    LastName: 'Mohamed',
    Gender: 'Female',
    Salary: 12000,
    DepartmentID: 2
  },
  {
    EmployeeID: 3,
    FirstName: 'Mohamed',
    LastName: 'aqra',
    Gender: 'Male',
    Salary: 10000,
    DepartmentID: 3
  },
  {
    EmployeeID: 4,
    FirstName: 'Mona',
    LastName: 'Khaled',
    Gender: 'Female',
    Salary: 11000,
    DepartmentID: 4
  },
  {
    EmployeeID: 5,
    FirstName: 'Mohamed',
    LastName: 'ayman',
    Gender: 'Male',
    Salary: 13000,
    DepartmentID: 1
  }
];

const mockBranches: Branch[] = [
  { BranchID: 1, BranchName: 'Cairo Main Branch', Location: 'Cairo, Egypt', Email: 'cairo@bank.com', EstablishedYear: 1990 },
  { BranchID: 2, BranchName: 'Alexandria Branch', Location: 'Alexandria, Egypt', Email: 'alex@bank.com', EstablishedYear: 1995 },
  { BranchID: 3, BranchName: 'Giza Branch', Location: 'Giza, Egypt', Email: 'giza@bank.com', EstablishedYear: 2000 }
];

const mockDepartments: Department[] = [
  { DepartmentID: 1, DepartmentName: 'HR Department', BranchID: 1 },
  { DepartmentID: 2, DepartmentName: 'IT Department', BranchID: 1 },
  { DepartmentID: 3, DepartmentName: 'Operations', BranchID: 2 },
  { DepartmentID: 4, DepartmentName: 'Customer Service', BranchID: 3 }
];

const mockATMs: ATM[] = [
  { ATMID: 1, Location: 'Cairo Main Entrance', InstallDate: '2015-03-10', Status: 'Active', BranchID: 1 },
  { ATMID: 2, Location: 'Alexandria Mall', InstallDate: '2018-07-22', Status: 'Active', BranchID: 2 },
  { ATMID: 3, Location: 'Giza Square', InstallDate: '2020-01-15', Status: 'Offline', BranchID: 3 }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  login: {
    customer: async (nationalId: string, password: string) => {
      await delay(500);
      const customer = mockCustomers.find(c => c.NationalID === nationalId);
      if (customer && password === 'password') {
        return { success: true, user: { ...customer, type: 'customer' } };
      }
      return { success: false, error: 'Invalid credentials' };
    },
    employee: async (email: string, password: string) => {
      await delay(500);
      const employee = mockEmployees.find(e => e.FirstName.toLowerCase() + '.' + e.LastName.toLowerCase() === email.toLowerCase() || String(e.EmployeeID) === email);
      if (employee && password === 'password') {
        return { success: true, user: { ...employee, type: 'employee', email: email } };
      }
      return { success: false, error: 'Invalid credentials' };
    }
  },
  
  customers: {
    getAll: async () => {
      await delay(300);
      return mockCustomers;
    },
    getById: async (id: number) => {
      await delay(200);
      return mockCustomers.find(c => c.CustomerID === id);
    }
  },
  
  accounts: {
    getByCustomerId: async (customerId: number) => {
      await delay(300);
      return mockAccounts.filter(a => a.CustomerID === customerId);
    },
    getAll: async () => {
      await delay(300);
      return mockAccounts;
    },
    create: async (account: Partial<BankAccount>) => {
      await delay(500);
      const newAccount: BankAccount = {
        AccountID: mockAccounts.length + 1,
        AccountNumber: `ACC-${1000 + mockAccounts.length + 1}`,
        OpenDate: new Date().toISOString().split('T')[0],
        AccountType: account.AccountType || 'Savings',
        CustomerID: account.CustomerID || 1,
        BranchID: account.BranchID || 1,
        balance: 0
      };
      mockAccounts.push(newAccount);
      return newAccount;
    }
  },
  
  transactions: {
    getByAccountId: async (accountId: number) => {
      await delay(300);
      return mockTransactions.filter(t => t.AccountID === accountId);
    },
    getAll: async () => {
      await delay(300);
      return mockTransactions;
    },
    create: async (transaction: Partial<Transaction>) => {
      await delay(500);
      const newTransaction: Transaction = {
        TransactionID: mockTransactions.length + 1,
        Amount: transaction.Amount || 0,
        Date_Time: new Date().toISOString(),
        TransactionType: transaction.TransactionType || 'Deposit',
        AccountID: transaction.AccountID || 1,
        ATMID: transaction.ATMID || 1
      };
      mockTransactions.push(newTransaction);
      
      const account = mockAccounts.find(a => a.AccountID === newTransaction.AccountID);
      if (account) {
        if (newTransaction.TransactionType === 'Deposit') {
          account.balance = (account.balance || 0) + newTransaction.Amount;
        } else if (newTransaction.TransactionType === 'Withdraw') {
          account.balance = (account.balance || 0) - newTransaction.Amount;
        }
      }
      return newTransaction;
    }
  },
  
  loans: {
    getByCustomerId: async (customerId: number) => {
      await delay(300);
      return mockLoanApplications.filter(l => l.CustomerID === customerId);
    },
    getAll: async () => {
      await delay(300);
      return mockLoanApplications;
    },
    create: async (loan: Partial<LoanApplication>) => {
      await delay(500);
      const newLoan: LoanApplication = {
        ApplicationID: mockLoanApplications.length + 1,
        AppDate: new Date().toISOString().split('T')[0],
        CustomerID: loan.CustomerID || 1,
        status: 'Pending'
      };
      mockLoanApplications.push(newLoan);
      return newLoan;
    }
  },
  
  employees: {
    getAll: async () => {
      await delay(300);
      return mockEmployees;
    }
  },
  
  branches: {
    getAll: async () => {
      await delay(300);
      return mockBranches;
    }
  },
  
  departments: {
    getAll: async () => {
      await delay(300);
      return mockDepartments;
    }
  },
  
  ATMs: {
    getAll: async () => {
      await delay(300);
      return mockATMs;
    }
  }
};