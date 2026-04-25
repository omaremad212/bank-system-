export const transactions = [
  { TransactionID: 1, Amount: 5000.00, Date_Time: '2024-01-15 10:30:00', TransactionType: 'Deposit', AccountID: 1, ATMID: 1 },
  { TransactionID: 2, Amount: 1000.00, Date_Time: '2024-02-10 14:00:00', TransactionType: 'Withdraw', AccountID: 2, ATMID: 1 },
  { TransactionID: 3, Amount: 3000.00, Date_Time: '2024-03-05 09:15:00', TransactionType: 'Deposit', AccountID: 3, ATMID: 1 },
  { TransactionID: 4, Amount: 500.00, Date_Time: '2024-04-01 16:45:00', TransactionType: 'Withdraw', AccountID: 4, ATMID: 1 },
  { TransactionID: 5, Amount: 2000.00, Date_Time: '2024-01-20 11:00:00', TransactionType: 'Deposit', AccountID: 1, ATMID: 1 },
  { TransactionID: 6, Amount: 1500.00, Date_Time: '2024-02-25 15:30:00', TransactionType: 'Deposit', AccountID: 2, ATMID: 1 },
  { TransactionID: 7, Amount: 800.00, Date_Time: '2024-03-12 08:45:00', TransactionType: 'Withdraw', AccountID: 3, ATMID: 1 },
  { TransactionID: 8, Amount: 2500.00, Date_Time: '2024-04-05 13:20:00', TransactionType: 'Deposit', AccountID: 4, ATMID: 1 },
];

export const atms = [
  { ATMID: 1, Location: 'Main Branch Entrance', InstallDate: '2015-03-10', Status: 'Active', BranchID: 1 },
];

export const loanApplications = [
  { ApplicationID: 1, AppDate: '2023-06-01', StartDate: '2023-07-01', EndDate: '2026-07-01', ApprovedAmt: 50000.00, Status: 'Approved', CustomerID: 1 },
  { ApplicationID: 2, AppDate: '2023-09-15', StartDate: '2023-10-01', EndDate: '2025-10-01', ApprovedAmt: 30000.00, Status: 'Approved', CustomerID: 2 },
  { ApplicationID: 3, AppDate: '2024-01-10', StartDate: null, EndDate: null, ApprovedAmt: null, Status: 'Pending', CustomerID: 3 },
];

export default transactions;