# Bank Management System

A full-stack banking system built with React, Node.js, Express, and MySQL. Features a normalized 3NF database design with complete customer and employee portals.

---

## Features

### Customer Portal
- Login using National ID & Password
- View all bank accounts
- Check account balance (calculated from transactions)
- View transaction history
- Deposit money
- Withdraw money
- Transfer money between accounts
- Apply for loans

### Employee/Admin Dashboard
- Manage customers (Add / Edit / Delete)
- Manage bank accounts (Savings / Checking)
- View all transactions
- Approve / Reject loan applications
- Manage employees (Manager / Teller / Clerk)
- Manage branches & departments
- Manage ATMs

---

## Database Design (3NF)

The system follows a fully normalized database schema:

| Table | Description |
|-------|-------------|
| branch | Bank branches |
| department | Departments within branches |
| employee | Employee records |
| manager_details | Manager role details |
| teller_details | Teller role details |
| clerk_details | Clerk role details |
| customer | Customer records |
| customer_phone | Customer phone numbers |
| bank_account | Bank accounts |
| savings_account | Savings account details |
| checking_account | Checking account details |
| transaction | Transaction records |
| atm | ATM locations |
| loan_application | Loan applications |

### Key Relationships
- Customer has many bank accounts
- Customer has many phone numbers
- Bank account belongs to customer and branch
- Account has many transactions
- Savings/Checking account extends bank_account
- Branch has many departments, accounts, ATMs
- Department belongs to branch
- Employee belongs to department
- Employee has one role details record

---

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js / Express
- **Database**: MySQL / MariaDB
- **Authentication**: JWT + bcrypt
- **Deployment**: Vercel

---

## Setup

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

```bash
# Create a MySQL database named 'banking_system'
mysql -u root -p -e "CREATE DATABASE banking_system;"

# Import the SQL schema
mysql -u root -p banking_system < banking_system.sql

# Run migrations for new columns (if upgrading)
mysql -u root -p banking_system < migrations.sql
```

### 4. Set up environment variables

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your database credentials
```

### 5. Run the backend server

```bash
npm run server
```

The API will be available at `http://localhost:3000`

### 6. Run the frontend

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Environment Variables

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=banking_system
DB_PORT=3306
JWT_SECRET=your-super-secret-key-change-in-production
PORT=3000
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|-------|----------|-------------|
| POST | /api/login/customer | Customer login |
| POST | /api/login/employee | Employee login |

### Customer API

| Method | Endpoint | Description |
|-------|----------|-------------|
| GET | /api/customer/profile | Get customer profile |
| GET | /api/customer/accounts | Get all accounts |
| GET | /api/customer/accounts/:id/transactions | Get account transactions |
| POST | /api/customer/deposit | Deposit money |
| POST | /api/customer/withdraw | Withdraw money |
| POST | /api/customer/transfer | Transfer money |
| GET | /api/customer/loans | Get loan applications |
| POST | /api/customer/loans | Submit loan application |

### Admin API

| Method | Endpoint | Description |
|-------|----------|-------------|
| GET | /api/admin/customers | Get all customers |
| POST | /api/admin/customers | Create customer |
| PUT | /api/admin/customers/:id | Update customer |
| DELETE | /api/admin/customers/:id | Delete customer |
| GET | /api/admin/accounts | Get all accounts |
| POST | /api/admin/accounts | Create account |
| DELETE | /api/admin/accounts/:id | Delete account |
| GET | /api/admin/employees | Get all employees |
| POST | /api/admin/employees | Create employee |
| PUT | /api/admin/employees/:id | Update employee |
| DELETE | /api/admin/employees/:id | Delete employee |
| GET | /api/admin/branches | Get all branches |
| POST | /api/admin/branches | Create branch |
| PUT | /api/admin/branches/:id | Update branch |
| DELETE | /api/admin/branches/:id | Delete branch |
| GET | /api/admin/departments | Get all departments |
| POST | /api/admin/departments | Create department |
| PUT | /api/admin/departments/:id | Update department |
| DELETE | /api/admin/departments/:id | Delete department |
| GET | /api/admin/atms | Get all ATMs |
| POST | /api/admin/atms | Create ATM |
| PUT | /api/admin/atms/:id | Update ATM |
| DELETE | /api/admin/atms/:id | Delete ATM |
| GET | /api/admin/transactions | Get all transactions |
| GET | /api/admin/loans | Get all loan applications |
| PUT | /api/admin/loans/:id | Update loan application |

---

## Demo Credentials

### Customer Login
- **National ID**: `29901011234567` (Mohamed Youssef)
- **National ID**: `30005152345678` (Nour Tarek)
- **National ID**: `29808203456789` (Bassem Fathy)
- **Password**: `0000` (for all customers)

### Employee Login (use EmployeeID, not NationalID)
- **Employee ID**: `1` (Mohamed Anwar - Branch Manager) - Full admin access
- **Employee ID**: `2` (Sara Mohamed - Clerk)
- **Employee ID**: `3` (Mohamed aqra - Teller)
- **Employee ID**: `4` (Mona khaled - Clerk)
- **Password**: `0000` (for all employees)

---

## Build for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

---

## Deploy to Vercel

1. Push your code to GitHub
2. Import the project to Vercel
3. Configure environment variables in Vercel
4. Deploy

For manual deployment:

```bash
npx vercel --prod
```

---

## Project Structure

```
bank-system-/
├── src/
│   ├── components/       # Reusable components
│   ├── context/        # React context (Auth)
│   ├── data/          # Static data files
│   ├── pages/        # Page components
│   │   ├── customer/ # Customer portal
│   │   └── employee/ # Employee dashboard
│   ├── services/     # API service
│   ├── types/         # TypeScript types
│   ├── App.tsx        # Main app
│   └── main.tsx       # Entry point
├── server/
│   ├── index.js      # Express API
│   └── db.js        # Database config
├── dist/             # Production build
├── migrations.sql     # Database migrations
├── banking_system.sql # Database schema
├── package.json
├── vite.config.ts
└── README.md
```

---

## License

MIT