export interface Customer {
  CustomerID: number;
  NationalID: string;
  FirstName: string;
  LastName: string;
  Gender: 'Male' | 'Female';
  Street?: string;
  Area?: string;
  State?: string;
  DateOfBirth?: string;
  phones?: string[];
}

export interface BankAccount {
  AccountID: number;
  AccountNumber: string;
  OpenDate: string;
  AccountType: 'Savings' | 'Checking';
  CustomerID: number;
  BranchID: number;
  balance?: number;
  interestRate?: number;
  overdraftLimit?: number;
}

export interface Transaction {
  TransactionID: number;
  Amount: number;
  Date_Time: string;
  TransactionType: 'Deposit' | 'Withdraw' | 'Transfer';
  AccountID: number;
  ATMID?: number;
}

export interface LoanApplication {
  ApplicationID: number;
  AppDate: string;
  StartDate?: string;
  EndDate?: string;
  ApprovedAmt?: number;
  CustomerID: number;
  status?: 'Pending' | 'Approved' | 'Rejected';
}

export interface Employee {
  EmployeeID: number;
  FirstName: string;
  LastName: string;
  Gender: 'Male' | 'Female';
  Salary?: number;
  DepartmentID: number;
}

export interface Branch {
  BranchID: number;
  BranchName: string;
  Location?: string;
  Email?: string;
  EstablishedYear?: number;
}

export interface Department {
  DepartmentID: number;
  DepartmentName: string;
  BranchID?: number;
}

export interface ATM {
  ATMID: number;
  Location?: string;
  InstallDate?: string;
  Status: 'Active' | 'Offline';
  BranchID?: number;
}

export interface User {
  id: number;
  type: 'customer' | 'employee';
  name: string;
  nationalId?: string;
  email?: string;
}