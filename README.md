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

- Frontend: React + Vite + TypeScript
- Backend: Node.js / API Routes
- Database: MySQL / MariaDB
- Deployment: Vercel
- Version Control: GitHub

---

## ⚙️ Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/omaremad212/bank-system-.git
cd bank-system-
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up MySQL database
- Create a MySQL database named `banking_system`
- Import the `banking_system.sql` file into your database
- Copy `.env.example` to `.env` and update the database credentials

### 4. Run the backend server
```bash
npm run server
```

### 5. Run the frontend
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
```

### 5. Deploy to Vercel
```bash
# Push to GitHub, then connect to Vercel
npx vercel --prod
```

---

## 🔑 Login Credentials

### Customer Login
- NationalID: 29901011234567
- Password: 0000

### Employee Login
- Employee ID: 1
- Password: 0000
