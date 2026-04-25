export const transactions = [
  { TransactionID: 1, Amount: 5000, Date_Time: '2024-01-15T10:30:00', TransactionType: 'Deposit', AccountID: 1, ATMID: 1 },
  { TransactionID: 2, Amount: 1000, Date_Time: '2024-02-10T14:00:00', TransactionType: 'Withdraw', AccountID: 2, ATMID: 1 },
  { TransactionID: 3, Amount: 3000, Date_Time: '2024-03-05T09:15:00', TransactionType: 'Transfer', AccountID: 3, ATMID: 2 },
  { TransactionID: 4, Amount: 500, Date_Time: '2024-04-01T16:45:00', TransactionType: 'Deposit', AccountID: 4, ATMID: 3 },
];

export const atms = [
  { ATMID: 1, Location: 'Cairo Main Entrance', InstallDate: '2015-03-10', Status: 'Active', BranchID: 1 },
  { ATMID: 2, Location: 'Alexandria Mall', InstallDate: '2018-07-22', Status: 'Active', BranchID: 2 },
  { ATMID: 3, Location: 'Giza Square', InstallDate: '2020-01-15', Status: 'Offline', BranchID: 3 },
];