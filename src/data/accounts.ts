export const bankAccounts = [
  { AccountID: 1, AccountNumber: 'ACC-1001', OpenDate: '2020-01-10', AccountType: 'Savings', CustomerID: 1, BranchID: 1 },
  { AccountID: 2, AccountNumber: 'ACC-1002', OpenDate: '2021-03-15', AccountType: 'Checking', CustomerID: 1, BranchID: 1 },
  { AccountID: 3, AccountNumber: 'ACC-1003', OpenDate: '2019-07-20', AccountType: 'Savings', CustomerID: 2, BranchID: 2 },
  { AccountID: 4, AccountNumber: 'ACC-1004', OpenDate: '2022-11-05', AccountType: 'Checking', CustomerID: 3, BranchID: 3 },
];

export const savingsAccounts = [
  { AccountID: 1, InterestRate: 5.50 },
  { AccountID: 3, InterestRate: 4.75 },
];

export const checkingAccounts = [
  { AccountID: 2, OverdraftLimit: 2000.00 },
  { AccountID: 4, OverdraftLimit: 1500.00 },
];