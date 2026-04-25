-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 25, 2026 at 08:01 PM
-- Server version: 10.4.18-MariaDB
-- PHP Version: 8.0.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `banking_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `atm`
--

CREATE TABLE `atm` (
  `ATMID` int(11) NOT NULL,
  `Location` varchar(150) DEFAULT NULL,
  `InstallDate` date DEFAULT NULL,
  `Status` enum('Active','Offline') DEFAULT 'Active',
  `BranchID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `atm`
--

INSERT INTO `atm` (`ATMID`, `Location`, `InstallDate`, `Status`, `BranchID`) VALUES
(1, 'Cairo Main Entrance', '2015-03-10', 'Active', 1),
(2, 'Alexandria Mall', '2018-07-22', 'Active', 2),
(3, 'Giza Square', '2020-01-15', 'Offline', 3);

-- --------------------------------------------------------

--
-- Table structure for table `bank_account`
--

CREATE TABLE `bank_account` (
  `AccountID` int(11) NOT NULL,
  `AccountNumber` varchar(20) NOT NULL,
  `OpenDate` date NOT NULL,
  `AccountType` enum('Savings','Checking') NOT NULL,
  `CustomerID` int(11) DEFAULT NULL,
  `BranchID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `bank_account`
--

INSERT INTO `bank_account` (`AccountID`, `AccountNumber`, `OpenDate`, `AccountType`, `CustomerID`, `BranchID`) VALUES
(1, 'ACC-1001', '2020-01-10', 'Savings', 1, 1),
(2, 'ACC-1002', '2021-03-15', 'Checking', 1, 1),
(3, 'ACC-1003', '2019-07-20', 'Savings', 2, 2),
(4, 'ACC-1004', '2022-11-05', 'Checking', 3, 3);

-- --------------------------------------------------------

--
-- Table structure for table `branch`
--

CREATE TABLE `branch` (
  `BranchID` int(11) NOT NULL,
  `BranchName` varchar(100) NOT NULL,
  `Location` varchar(150) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `EstablishedYear` year(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `branch`
--

INSERT INTO `branch` (`BranchID`, `BranchName`, `Location`, `Email`, `EstablishedYear`) VALUES
(1, 'Cairo Main Branch', 'Cairo, Egypt', 'cairo@bank.com', 1990),
(2, 'Alexandria Branch', 'Alexandria, Egypt', 'alex@bank.com', 1995),
(3, 'Giza Branch', 'Giza, Egypt', 'giza@bank.com', 2000);

-- --------------------------------------------------------

--
-- Table structure for table `checking_account`
--

CREATE TABLE `checking_account` (
  `AccountID` int(11) NOT NULL,
  `OverdraftLimit` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `checking_account`
--

INSERT INTO `checking_account` (`AccountID`, `OverdraftLimit`) VALUES
(2, '2000.00'),
(4, '1500.00');

-- --------------------------------------------------------

--
-- Table structure for table `clerk_details`
--

CREATE TABLE `clerk_details` (
  `EmployeeID` int(11) NOT NULL,
  `ClerkLevel` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `clerk_details`
--

INSERT INTO `clerk_details` (`EmployeeID`, `ClerkLevel`) VALUES
(2, 'Senior Clerk');

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `CustomerID` int(11) NOT NULL,
  `NationalID` varchar(20) NOT NULL,
  `FirstName` varchar(50) NOT NULL,
  `LastName` varchar(50) NOT NULL,
  `Gender` enum('Male','Female') DEFAULT NULL,
  `Street` varchar(100) DEFAULT NULL,
  `Area` varchar(100) DEFAULT NULL,
  `State` varchar(100) DEFAULT NULL,
  `DateOfBirth` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`CustomerID`, `NationalID`, `FirstName`, `LastName`, `Gender`, `Street`, `Area`, `State`, `DateOfBirth`) VALUES
(1, '29901011234567', 'Mohamed', 'Youssef', 'Male', '15 Nile St', 'Dokki', 'Cairo', '1999-01-01'),
(2, '30005152345678', 'Nour', 'Tarek', 'Female', '22 Hassan St', 'Sidi Gaber', 'Alexandria', '2000-05-15'),
(3, '29808203456789', 'Bassem', 'Fathy', 'Male', '8 Pyramids Rd', 'Haram', 'Giza', '1998-08-20');

-- --------------------------------------------------------

--
-- Table structure for table `customer_phone`
--

CREATE TABLE `customer_phone` (
  `CustomerID` int(11) NOT NULL,
  `Phone` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `customer_phone`
--

INSERT INTO `customer_phone` (`CustomerID`, `Phone`) VALUES
(1, '01012345678'),
(1, '01198765432'),
(2, '01223456789'),
(3, '01534567890');

-- --------------------------------------------------------

--
-- Table structure for table `department`
--

CREATE TABLE `department` (
  `DepartmentID` int(11) NOT NULL,
  `DepartmentName` varchar(100) NOT NULL,
  `BranchID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `department`
--

INSERT INTO `department` (`DepartmentID`, `DepartmentName`, `BranchID`) VALUES
(1, 'HR Department', 1),
(2, 'IT Department', 1),
(3, 'Operations', 2),
(4, 'Customer Service', 3);

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `EmployeeID` int(11) NOT NULL,
  `FirstName` varchar(50) NOT NULL,
  `LastName` varchar(50) NOT NULL,
  `Gender` enum('Male','Female') NOT NULL,
  `Salary` decimal(10,2) DEFAULT NULL,
  `DepartmentID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`EmployeeID`, `FirstName`, `LastName`, `Gender`, `Salary`, `DepartmentID`) VALUES
(1, '’Mohamed', 'Anwar', 'Male', '15000.00', 1),
(2, 'Sara', 'Mohamed', 'Female', '12000.00', 2),
(3, 'Mohamed', 'aqra', 'Male', '10000.00', 3),
(4, 'Mona', 'Khaled', 'Female', '11000.00', 4),
(5, 'Mohamed', 'ayman', 'Male', '13000.00', 1);

-- --------------------------------------------------------

--
-- Table structure for table `loan_application`
--

CREATE TABLE `loan_application` (
  `ApplicationID` int(11) NOT NULL,
  `AppDate` date NOT NULL,
  `StartDate` date DEFAULT NULL,
  `EndDate` date DEFAULT NULL,
  `ApprovedAmt` decimal(12,2) DEFAULT NULL,
  `CustomerID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `loan_application`
--

INSERT INTO `loan_application` (`ApplicationID`, `AppDate`, `StartDate`, `EndDate`, `ApprovedAmt`, `CustomerID`) VALUES
(1, '2023-06-01', '2023-07-01', '2026-07-01', '50000.00', 1),
(2, '2023-09-15', '2023-10-01', '2025-10-01', '30000.00', 2),
(3, '2024-01-10', '2024-02-01', '2027-02-01', '70000.00', 3);

-- --------------------------------------------------------

--
-- Table structure for table `manager_details`
--

CREATE TABLE `manager_details` (
  `EmployeeID` int(11) NOT NULL,
  `JobTitle` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `manager_details`
--

INSERT INTO `manager_details` (`EmployeeID`, `JobTitle`) VALUES
(1, 'Branch Manager'),
(5, 'Department Manager');

-- --------------------------------------------------------

--
-- Table structure for table `savings_account`
--

CREATE TABLE `savings_account` (
  `AccountID` int(11) NOT NULL,
  `InterestRate` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `savings_account`
--

INSERT INTO `savings_account` (`AccountID`, `InterestRate`) VALUES
(1, '5.50'),
(3, '4.75');

-- --------------------------------------------------------

--
-- Table structure for table `teller_details`
--

CREATE TABLE `teller_details` (
  `EmployeeID` int(11) NOT NULL,
  `BranchLocation` varchar(150) DEFAULT NULL,
  `TellerID` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `teller_details`
--

INSERT INTO `teller_details` (`EmployeeID`, `BranchLocation`, `TellerID`) VALUES
(3, 'Alexandria, Egypt', 'TEL-001'),
(4, 'Giza, Egypt', 'TEL-002');

-- --------------------------------------------------------

--
-- Table structure for table `transaction`
--

CREATE TABLE `transaction` (
  `TransactionID` int(11) NOT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `Date_Time` datetime DEFAULT current_timestamp(),
  `TransactionType` enum('Deposit','Withdraw','Transfer') NOT NULL,
  `AccountID` int(11) DEFAULT NULL,
  `ATMID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `transaction`
--

INSERT INTO `transaction` (`TransactionID`, `Amount`, `Date_Time`, `TransactionType`, `AccountID`, `ATMID`) VALUES
(1, '5000.00', '2024-01-15 10:30:00', 'Deposit', 1, 1),
(2, '1000.00', '2024-02-10 14:00:00', 'Withdraw', 2, 1),
(3, '3000.00', '2024-03-05 09:15:00', 'Transfer', 3, 2),
(4, '500.00', '2024-04-01 16:45:00', 'Deposit', 4, 3);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `atm`
--
ALTER TABLE `atm`
  ADD PRIMARY KEY (`ATMID`),
  ADD KEY `BranchID` (`BranchID`);

--
-- Indexes for table `bank_account`
--
ALTER TABLE `bank_account`
  ADD PRIMARY KEY (`AccountID`),
  ADD UNIQUE KEY `AccountNumber` (`AccountNumber`),
  ADD KEY `CustomerID` (`CustomerID`),
  ADD KEY `BranchID` (`BranchID`);

--
-- Indexes for table `branch`
--
ALTER TABLE `branch`
  ADD PRIMARY KEY (`BranchID`);

--
-- Indexes for table `checking_account`
--
ALTER TABLE `checking_account`
  ADD PRIMARY KEY (`AccountID`);

--
-- Indexes for table `clerk_details`
--
ALTER TABLE `clerk_details`
  ADD PRIMARY KEY (`EmployeeID`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`CustomerID`),
  ADD UNIQUE KEY `NationalID` (`NationalID`);

--
-- Indexes for table `customer_phone`
--
ALTER TABLE `customer_phone`
  ADD PRIMARY KEY (`CustomerID`,`Phone`);

--
-- Indexes for table `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`DepartmentID`),
  ADD KEY `BranchID` (`BranchID`);

--
-- Indexes for table `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`EmployeeID`),
  ADD KEY `DepartmentID` (`DepartmentID`);

--
-- Indexes for table `loan_application`
--
ALTER TABLE `loan_application`
  ADD PRIMARY KEY (`ApplicationID`),
  ADD KEY `CustomerID` (`CustomerID`);

--
-- Indexes for table `manager_details`
--
ALTER TABLE `manager_details`
  ADD PRIMARY KEY (`EmployeeID`);

--
-- Indexes for table `savings_account`
--
ALTER TABLE `savings_account`
  ADD PRIMARY KEY (`AccountID`);

--
-- Indexes for table `teller_details`
--
ALTER TABLE `teller_details`
  ADD PRIMARY KEY (`EmployeeID`);

--
-- Indexes for table `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`TransactionID`),
  ADD KEY `AccountID` (`AccountID`),
  ADD KEY `ATMID` (`ATMID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `atm`
--
ALTER TABLE `atm`
  MODIFY `ATMID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `bank_account`
--
ALTER TABLE `bank_account`
  MODIFY `AccountID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `branch`
--
ALTER TABLE `branch`
  MODIFY `BranchID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `CustomerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `department`
--
ALTER TABLE `department`
  MODIFY `DepartmentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `employee`
--
ALTER TABLE `employee`
  MODIFY `EmployeeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `loan_application`
--
ALTER TABLE `loan_application`
  MODIFY `ApplicationID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `transaction`
--
ALTER TABLE `transaction`
  MODIFY `TransactionID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `atm`
--
ALTER TABLE `atm`
  ADD CONSTRAINT `atm_ibfk_1` FOREIGN KEY (`BranchID`) REFERENCES `branch` (`BranchID`);

--
-- Constraints for table `bank_account`
--
ALTER TABLE `bank_account`
  ADD CONSTRAINT `bank_account_ibfk_1` FOREIGN KEY (`CustomerID`) REFERENCES `customer` (`CustomerID`),
  ADD CONSTRAINT `bank_account_ibfk_2` FOREIGN KEY (`BranchID`) REFERENCES `branch` (`BranchID`);

--
-- Constraints for table `checking_account`
--
ALTER TABLE `checking_account`
  ADD CONSTRAINT `checking_account_ibfk_1` FOREIGN KEY (`AccountID`) REFERENCES `bank_account` (`AccountID`);

--
-- Constraints for table `clerk_details`
--
ALTER TABLE `clerk_details`
  ADD CONSTRAINT `clerk_details_ibfk_1` FOREIGN KEY (`EmployeeID`) REFERENCES `employee` (`EmployeeID`);

--
-- Constraints for table `customer_phone`
--
ALTER TABLE `customer_phone`
  ADD CONSTRAINT `customer_phone_ibfk_1` FOREIGN KEY (`CustomerID`) REFERENCES `customer` (`CustomerID`);

--
-- Constraints for table `department`
--
ALTER TABLE `department`
  ADD CONSTRAINT `department_ibfk_1` FOREIGN KEY (`BranchID`) REFERENCES `branch` (`BranchID`);

--
-- Constraints for table `employee`
--
ALTER TABLE `employee`
  ADD CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`DepartmentID`) REFERENCES `department` (`DepartmentID`);

--
-- Constraints for table `loan_application`
--
ALTER TABLE `loan_application`
  ADD CONSTRAINT `loan_application_ibfk_1` FOREIGN KEY (`CustomerID`) REFERENCES `customer` (`CustomerID`);

--
-- Constraints for table `manager_details`
--
ALTER TABLE `manager_details`
  ADD CONSTRAINT `manager_details_ibfk_1` FOREIGN KEY (`EmployeeID`) REFERENCES `employee` (`EmployeeID`);

--
-- Constraints for table `savings_account`
--
ALTER TABLE `savings_account`
  ADD CONSTRAINT `savings_account_ibfk_1` FOREIGN KEY (`AccountID`) REFERENCES `bank_account` (`AccountID`);

--
-- Constraints for table `teller_details`
--
ALTER TABLE `teller_details`
  ADD CONSTRAINT `teller_details_ibfk_1` FOREIGN KEY (`EmployeeID`) REFERENCES `employee` (`EmployeeID`);

--
-- Constraints for table `transaction`
--
ALTER TABLE `transaction`
  ADD CONSTRAINT `transaction_ibfk_1` FOREIGN KEY (`AccountID`) REFERENCES `bank_account` (`AccountID`),
  ADD CONSTRAINT `transaction_ibfk_2` FOREIGN KEY (`ATMID`) REFERENCES `atm` (`ATMID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
