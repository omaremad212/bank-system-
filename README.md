# 🏦 Bank Management System

A full-stack banking system built with a normalized database design (3NF), supporting both customer and employee operations.

---

## 🚀 Features

### 👤 Customer Portal
- Login using National ID & Password
- View all bank accounts
- Check account balance
- View transaction history
- Deposit / Withdraw money
- Transfer money between accounts
- Apply for loans

---

### 🧑‍💼 Employee / Admin Dashboard
- Manage customers (Add / Edit / Delete)
- Manage accounts (Savings / Checking)
- View and manage transactions
- Approve / Reject loan applications
- Manage employees (Manager / Teller / Clerk)
- Manage branches & departments
- Manage ATMs

---

## 🧩 Database Design (3NF)

The system follows a fully normalized database schema:

- Branch
- Department
- Employee
- Manager_Details
- Teller_Details
- Clerk_Details
- Customer
- Customer_Phone
- Bank_Account
- Savings_Account
- Checking_Account
- Transaction
- ATM
- Loan_Application

---

## 🔐 Authentication

- Customer login via NationalID + Password
- Employee login via EmployeeID / Email + Password
- Secure password hashing implemented
- Role-based access control

---

## 💰 Transactions

Supported operations:
- Deposit
- Withdraw
- Transfer

Rules:
- Balance updates automatically
- Overdraft allowed only for checking accounts
- All operations are logged

---

## 🛠 Tech Stack

- Frontend: (Next.js / React)  
- Backend: (Node.js / API Routes)  
- Database: (Your DB - MySQL / PostgreSQL / etc)  
- Deployment: Vercel  
- Version Control: GitHub  

---

## ⚙️ Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/omaremad212/bank-system-.git
cd bank-system-
