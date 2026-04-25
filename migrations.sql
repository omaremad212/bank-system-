-- Banking System Migrations
-- Add missing columns and security improvements

-- 1. Add Password column to customer table
ALTER TABLE `customer` ADD COLUMN `Password` varchar(255) DEFAULT NULL AFTER `DateOfBirth`;

-- 2. Add Password and Email columns to employee table
ALTER TABLE `employee` ADD COLUMN `Email` varchar(100) DEFAULT NULL AFTER `Salary`;
ALTER TABLE `employee` ADD COLUMN `Password` varchar(255) DEFAULT NULL AFTER `Email`;

-- 3. Add RelatedAccountID to transaction table for transfers
ALTER TABLE `transaction` ADD COLUMN `RelatedAccountID` int(11) DEFAULT NULL AFTER `AccountID`;

-- 4. Add Status column to loan_application table
ALTER TABLE `loan_application` ADD COLUMN `Status` enum('Pending','Approved','Rejected') DEFAULT 'Pending' AFTER `ApprovedAmt`;

-- Note: For the default password '0000', use bcrypt hash
-- Default bcrypt hash for '0000': $2a$10$8f7jZ9Y8kV0.HxO9Q8mW8OXkV0.HxO9Q8mW8OXkV0.HxO9Q8mW8O (fake for demo)
-- In production, generate real bcrypt hashes

-- Update loans with Status
UPDATE loan_application SET Status = 'Approved' WHERE ApprovedAmt IS NOT NULL;
UPDATE loan_application SET Status = 'Pending' WHERE ApprovedAmt IS NULL;