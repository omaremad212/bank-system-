-- Banking System Database Schema for Supabase PostgreSQL

-- Customer table
CREATE TABLE IF NOT EXISTS customer (
    CustomerID SERIAL PRIMARY KEY,
    NationalID VARCHAR(20) UNIQUE NOT NULL,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Gender VARCHAR(10),
    Street VARCHAR(100),
    Area VARCHAR(100),
    State VARCHAR(100),
    DateOfBirth DATE,
    Password VARCHAR(255)
);

-- Customer Phone table
CREATE TABLE IF NOT EXISTS customer_phone (
    CustomerID INT REFERENCES customer(CustomerID) ON DELETE CASCADE,
    Phone VARCHAR(20) NOT NULL,
    PRIMARY KEY (CustomerID, Phone)
);

-- Employee table
CREATE TABLE IF NOT EXISTS employee (
    EmployeeID SERIAL PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Gender VARCHAR(10) NOT NULL,
    Salary DECIMAL(10,2),
    Email VARCHAR(100),
    Password VARCHAR(255),
    DepartmentID INT
);

-- Branch table
CREATE TABLE IF NOT EXISTS branch (
    BranchID SERIAL PRIMARY KEY,
    BranchName VARCHAR(100) NOT NULL,
    Location VARCHAR(150),
    Email VARCHAR(100),
    EstablishedYear INT
);

-- Department table
CREATE TABLE IF NOT EXISTS department (
    DepartmentID SERIAL PRIMARY KEY,
    DepartmentName VARCHAR(100) NOT NULL,
    BranchID INT REFERENCES branch(BranchID)
);

-- Manager Details table
CREATE TABLE IF NOT EXISTS manager_details (
    EmployeeID INT REFERENCES employee(EmployeeID) ON DELETE CASCADE PRIMARY KEY,
    JobTitle VARCHAR(100)
);

-- Teller Details table
CREATE TABLE IF NOT EXISTS teller_details (
    EmployeeID INT REFERENCES employee(EmployeeID) ON DELETE CASCADE PRIMARY KEY,
    BranchLocation VARCHAR(150),
    TellerID VARCHAR(50)
);

-- Clerk Details table
CREATE TABLE IF NOT EXISTS clerk_details (
    EmployeeID INT REFERENCES employee(EmployeeID) ON DELETE CASCADE PRIMARY KEY,
    ClerkLevel VARCHAR(50)
);

-- Bank Account table
CREATE TABLE IF NOT EXISTS bank_account (
    AccountID SERIAL PRIMARY KEY,
    AccountNumber VARCHAR(20) UNIQUE NOT NULL,
    OpenDate DATE NOT NULL,
    AccountType VARCHAR(20) NOT NULL,
    CustomerID INT REFERENCES customer(CustomerID) ON DELETE SET NULL,
    BranchID INT REFERENCES branch(BranchID)
);

-- Savings Account table
CREATE TABLE IF NOT EXISTS savings_account (
    AccountID INT REFERENCES bank_account(AccountID) ON DELETE CASCADE PRIMARY KEY,
    InterestRate DECIMAL(5,2)
);

-- Checking Account table
CREATE TABLE IF NOT EXISTS checking_account (
    AccountID INT REFERENCES bank_account(AccountID) ON DELETE CASCADE PRIMARY KEY,
    OverdraftLimit DECIMAL(10,2)
);

-- ATM table
CREATE TABLE IF NOT EXISTS atm (
    ATMID SERIAL PRIMARY KEY,
    Location VARCHAR(150),
    InstallDate DATE,
    Status VARCHAR(20) DEFAULT 'Active',
    BranchID INT REFERENCES branch(BranchID)
);

-- Transaction table
CREATE TABLE IF NOT EXISTS transaction (
    TransactionID SERIAL PRIMARY KEY,
    Amount DECIMAL(12,2) NOT NULL,
    Date_Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TransactionType VARCHAR(20) NOT NULL,
    AccountID INT REFERENCES bank_account(AccountID) ON DELETE CASCADE,
    RelatedAccountID INT,
    ATMID INT REFERENCES atm(ATMID)
);

-- Loan Application table
CREATE TABLE IF NOT EXISTS loan_application (
    ApplicationID SERIAL PRIMARY KEY,
    AppDate DATE NOT NULL,
    StartDate DATE,
    EndDate DATE,
    ApprovedAmt DECIMAL(12,2),
    Status VARCHAR(20) DEFAULT 'Pending',
    CustomerID INT REFERENCES customer(CustomerID) ON DELETE SET NULL
);

-- Insert sample data
INSERT INTO branch (BranchID, BranchName, Location, Email, EstablishedYear) VALUES 
(1, 'Cairo Main Branch', 'Cairo, Egypt', 'cairo@bank.com', 1990),
(2, 'Alexandria Branch', 'Alexandria, Egypt', 'alex@bank.com', 1995),
(3, 'Giza Branch', 'Giza, Egypt', 'giza@bank.com', 2000)
ON CONFLICT (BranchID) DO NOTHING;

INSERT INTO department (DepartmentID, DepartmentName, BranchID) VALUES 
(1, 'HR Department', 1),
(2, 'IT Department', 1),
(3, 'Operations', 2),
(4, 'Customer Service', 3)
ON CONFLICT (DepartmentID) DO NOTHING;

INSERT INTO employee (EmployeeID, FirstName, LastName, Gender, Salary, Email, DepartmentID) VALUES 
(1, 'Mohamed', 'Anwar', 'Male', 15000.00, 'manager@bank.com', 1),
(2, 'Sara', 'Mohamed', 'Female', 12000.00, 'sara@bank.com', 2),
(3, 'Mohamed', 'aqra', 'Male', 10000.00, 'it@bank.com', 2),
(4, 'Mona', 'Khaled', 'Female', 11000.00, 'mona@bank.com', 4),
(5, 'Mohamed', 'ayman', 'Male', 13000.00, 'ayman@bank.com', 1)
ON CONFLICT (EmployeeID) DO NOTHING;

INSERT INTO manager_details (EmployeeID, JobTitle) VALUES 
(1, 'Branch Manager'),
(5, 'Department Manager')
ON CONFLICT (EmployeeID) DO NOTHING;

INSERT INTO teller_details (EmployeeID, BranchLocation, TellerID) VALUES 
(3, 'Cairo, Egypt', 'TEL-001')
ON CONFLICT (EmployeeID) DO NOTHING;

INSERT INTO clerk_details (EmployeeID, ClerkLevel) VALUES 
(2, 'Senior Clerk')
ON CONFLICT (EmployeeID) DO NOTHING;

INSERT INTO customer (CustomerID, NationalID, FirstName, LastName, Gender, Street, Area, State, DateOfBirth) VALUES 
(1, '29901011234567', 'Mohamed', 'Youssef', 'Male', '15 Nile St', 'Dokki', 'Cairo', '1999-01-01'),
(2, '30005152345678', 'Nour', 'Tarek', 'Female', '22 Hassan St', 'Sidi Gaber', 'Alexandria', '2000-05-15'),
(3, '29808203456789', 'Bassem', 'Fathy', 'Male', '8 Pyramids Rd', 'Haram', 'Giza', '1998-08-20')
ON CONFLICT (CustomerID) DO NOTHING;

INSERT INTO customer_phone (CustomerID, Phone) VALUES 
(1, '01012345678'),
(1, '01198765432'),
(2, '01223456789'),
(3, '01534567890')
ON CONFLICT DO NOTHING;

INSERT INTO bank_account (AccountID, AccountNumber, OpenDate, AccountType, CustomerID, BranchID) VALUES 
(1, 'ACC-1001', '2020-01-10', 'Savings', 1, 1),
(2, 'ACC-1002', '2021-03-15', 'Checking', 1, 1),
(3, 'ACC-1003', '2019-07-20', 'Savings', 2, 2),
(4, 'ACC-1004', '2022-11-05', 'Checking', 3, 3)
ON CONFLICT (AccountID) DO NOTHING;

INSERT INTO savings_account (AccountID, InterestRate) VALUES 
(1, 5.50),
(3, 4.75)
ON CONFLICT (AccountID) DO NOTHING;

INSERT INTO checking_account (AccountID, OverdraftLimit) VALUES 
(2, 2000.00),
(4, 1500.00)
ON CONFLICT (AccountID) DO NOTHING;

INSERT INTO atm (ATMID, Location, InstallDate, Status, BranchID) VALUES 
(1, 'Cairo Main Entrance', '2015-03-10', 'Active', 1),
(2, 'Alexandria Mall', '2018-07-22', 'Active', 2),
(3, 'Giza Square', '2020-01-15', 'Offline', 3)
ON CONFLICT (ATMID) DO NOTHING;

INSERT INTO transaction (TransactionID, Amount, Date_Time, TransactionType, AccountID, ATMID) VALUES 
(1, 5000.00, '2024-01-15 10:00:00', 'Deposit', 1, 1),
(2, 1000.00, '2024-01-16 14:30:00', 'Withdraw', 1, 1),
(3, 2000.00, '2024-02-01 09:00:00', 'Deposit', 2, 1),
(4, 500.00, '2024-02-05 16:00:00', 'Withdraw', 2, 2),
(5, 3000.00, '2024-02-10 11:00:00', 'Deposit', 3, 2)
ON CONFLICT (TransactionID) DO NOTHING;

INSERT INTO loan_application (ApplicationID, AppDate, StartDate, EndDate, ApprovedAmt, Status, CustomerID) VALUES 
(1, '2023-06-01', '2023-07-01', '2026-07-01', 50000.00, 'Approved', 1),
(2, '2023-09-15', '2023-10-01', '2025-10-01', 30000.00, 'Approved', 2),
(3, '2024-01-10', NULL, NULL, NULL, 'Pending', 3)
ON CONFLICT (ApplicationID) DO NOTHING;