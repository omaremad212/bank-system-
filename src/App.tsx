import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import CustomerLogin from './pages/CustomerLogin';
import EmployeeLogin from './pages/EmployeeLogin';
import CustomerDashboard from './pages/CustomerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ClerkDashboard from './pages/clerk/ClerkDashboard';
import ClerkCustomers from './pages/clerk/ClerkCustomers';
import ClerkAccounts from './pages/clerk/ClerkAccounts';
import CustomerHome from './pages/customer/CustomerHome';
import CustomerAccounts from './pages/customer/CustomerAccounts';
import CustomerTransactions from './pages/customer/CustomerTransactions';
import CustomerLoans from './pages/customer/CustomerLoans';
import ManagerDashboard from './pages/employee/ManagerDashboard';
import TellerDashboard from './pages/employee/TellerDashboard';
import EmployeeCustomers from './pages/employee/EmployeeCustomers';
import EmployeeAccounts from './pages/employee/EmployeeAccounts';
import EmployeeTransactions from './pages/employee/EmployeeTransactions';
import EmployeeLoans from './pages/employee/EmployeeLoans';
import EmployeeEmployees from './pages/employee/EmployeeEmployees';
import EmployeeBranches from './pages/employee/EmployeeBranches';
import EmployeeATMs from './pages/employee/EmployeeATMs';

const ProtectedRoute = ({ children, allowedType }: { children: React.ReactNode; allowedType: 'customer' | 'employee' | 'clerk' }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login/customer" />;
  }
  
  if (allowedType === 'customer' && user.type !== 'customer') {
    return <Navigate to="/employee" />;
  }
  
  if ((allowedType === 'employee' || allowedType === 'clerk') && user.type !== 'employee') {
    return <Navigate to="/customer" />;
  }
  
  return <>{children}</>;
};

const ClerkRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login/employee" />;
  }
  
  if (user.type !== 'employee') {
    return <Navigate to="/customer" />;
  }
  
  if (user.roleType !== 'Clerk') {
    return <Navigate to="/employee" />;
  }
  
  return <>{children}</>;
};

const ManagerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login/employee" />;
  }
  
  if (user.type !== 'employee') {
    return <Navigate to="/customer" />;
  }
  
  if (user.roleType !== 'Manager' && user.roleType !== 'Branch Manager') {
    if (user.roleType === 'Clerk') {
      return <Navigate to="/clerk/dashboard" />;
    }
    return <Navigate to="/employee" />;
  }
  
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (isAuthenticated && user) {
    if (user.type === 'customer') {
      return <Navigate to="/customer" />;
    }
    if (user.roleType === 'Clerk') {
      return <Navigate to="/clerk/dashboard" />;
    }
    return <Navigate to="/employee" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  const role = user?.roleType;
  
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      <Route path="/login/customer" element={
        <AuthRoute><CustomerLogin /></AuthRoute>
      } />
      <Route path="/login/employee" element={
        <AuthRoute><EmployeeLogin /></AuthRoute>
      } />
      
      <Route path="/customer" element={
        <ProtectedRoute allowedType="customer">
          <CustomerDashboard />
        </ProtectedRoute>
      }>
        <Route index element={<CustomerHome />} />
        <Route path="accounts" element={<CustomerAccounts />} />
        <Route path="transactions" element={<CustomerTransactions />} />
        <Route path="loans" element={<CustomerLoans />} />
      </Route>
      
      <Route path="/clerk" element={
        <ClerkRoute>
          <ClerkDashboard />
        </ClerkRoute>
      }>
        <Route index element={<Navigate to="/clerk/dashboard" />} />
        <Route path="dashboard" element={<ClerkCustomers />} />
        <Route path="customers" element={<ClerkCustomers />} />
        <Route path="accounts" element={<ClerkAccounts />} />
      </Route>
      
      <Route path="/employee" element={
        <ManagerRoute>
          <EmployeeDashboard />
        </ManagerRoute>
      }>
        <Route index element={<ManagerDashboard />} />
        <Route path="customers" element={<EmployeeCustomers />} />
        <Route path="accounts" element={<EmployeeAccounts />} />
        <Route path="transactions" element={<EmployeeTransactions />} />
        <Route path="loans" element={<EmployeeLoans />} />
        <Route path="employees" element={<EmployeeEmployees />} />
        <Route path="branches" element={<EmployeeBranches />} />
        <Route path="atms" element={<EmployeeATMs />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;