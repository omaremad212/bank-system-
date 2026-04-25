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
import ManagerDashboard from './pages/manager/ManagerDashboard';
import TellerDashboard from './pages/employee/TellerDashboard';
import ITDashboard from './pages/it/ITDashboard';
import CustomerServiceDashboard from './pages/customerservice/CustomerServiceDashboard';
import HRDashboard from './pages/hr/HRDashboard';
import EmployeeCustomers from './pages/employee/EmployeeCustomers';
import EmployeeAccounts from './pages/employee/EmployeeAccounts';
import EmployeeTransactions from './pages/employee/EmployeeTransactions';
import EmployeeLoans from './pages/employee/EmployeeLoans';
import EmployeeEmployees from './pages/employee/EmployeeEmployees';
import EmployeeBranches from './pages/employee/EmployeeBranches';
import EmployeeATMs from './pages/employee/EmployeeATMs';
import ManagerCustomers from './pages/manager/ManagerCustomers';
import ManagerAccounts from './pages/manager/ManagerAccounts';
import ManagerEmployees from './pages/manager/ManagerEmployees';
import ManagerLoans from './pages/manager/ManagerLoans';
import ManagerTransactions from './pages/manager/ManagerTransactions';
import ManagerBranches from './pages/manager/ManagerBranches';

const ProtectedRoute = ({ children, allowedType }: { children: React.ReactNode; allowedType: 'customer' | 'employee' }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login/customer" />;
  }
  
  if (allowedType === 'customer' && user.type !== 'customer') {
    return <Navigate to={`/${user.roleType?.toLowerCase().replace(' ', '')}/dashboard`} />;
  }
  
  if (allowedType === 'employee' && user.type !== 'employee') {
    return <Navigate to="/customer" />;
  }
  
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (isAuthenticated && user) {
    if (user.type === 'customer') {
      return <Navigate to="/customer" />;
    }
    const rolePath = getRolePath(user.roleType);
    return <Navigate to={rolePath} />;
  }
  
  return <>{children}</>;
};

const getRolePath = (roleType?: string) => {
  switch (roleType) {
    case 'Manager':
    case 'Branch Manager':
      return '/manager/dashboard';
    case 'Teller':
      return '/teller/dashboard';
    case 'Clerk':
      return '/clerk/dashboard';
    case 'IT':
      return '/it/dashboard';
    case 'Customer Service':
      return '/customer-service/dashboard';
    case 'HR':
      return '/hr/dashboard';
    default:
      return '/employee/dashboard';
  }
};

const getRoleRedirect = (roleType?: string) => {
  return getRolePath(roleType);
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
    return <Navigate to={getRoleRedirect(user.roleType)} />;
  }
  
  return <>{children}</>;
};

const TellerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login/employee" />;
  }
  
  if (user.type !== 'employee') {
    return <Navigate to="/customer" />;
  }
  
  if (user.roleType !== 'Teller') {
    return <Navigate to={getRoleRedirect(user.roleType)} />;
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
    return <Navigate to={getRoleRedirect(user.roleType)} />;
  }
  
  return <>{children}</>;
};

const ITRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login/employee" />;
  }
  
  if (user.type !== 'employee') {
    return <Navigate to="/customer" />;
  }
  
  if (user.roleType !== 'IT') {
    return <Navigate to={getRoleRedirect(user.roleType)} />;
  }
  
  return <>{children}</>;
};

const CustomerServiceRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login/employee" />;
  }
  
  if (user.type !== 'employee') {
    return <Navigate to="/customer" />;
  }
  
  if (user.roleType !== 'Customer Service') {
    return <Navigate to={getRoleRedirect(user.roleType)} />;
  }
  
  return <>{children}</>;
};

const HRRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login/employee" />;
  }
  
  if (user.type !== 'employee') {
    return <Navigate to="/customer" />;
  }
  
  if (user.roleType !== 'HR') {
    return <Navigate to={getRoleRedirect(user.roleType)} />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      <Route path="/login/customer" element={
        <AuthRoute><CustomerLogin /></AuthRoute>
      } />
      <Route path="/login/employee" element={
        <AuthRoute><EmployeeLogin /></AuthRoute>
      } />
      
      {/* Customer Routes */}
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
      
      {/* Clerk Routes */}
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
      
      {/* Manager Routes */}
      <Route path="/manager" element={
        <ManagerRoute>
          <EmployeeDashboard />
        </ManagerRoute>
      }>
        <Route index element={<Navigate to="/manager/dashboard" />} />
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="customers" element={<ManagerCustomers />} />
        <Route path="accounts" element={<ManagerAccounts />} />
        <Route path="employees" element={<ManagerEmployees />} />
        <Route path="loans" element={<ManagerLoans />} />
        <Route path="transactions" element={<ManagerTransactions />} />
        <Route path="branches" element={<ManagerBranches />} />
      </Route>
      
      {/* Teller Routes */}
      <Route path="/teller" element={
        <TellerRoute>
          <EmployeeDashboard />
        </TellerRoute>
      }>
        <Route index element={<Navigate to="/teller/dashboard" />} />
        <Route path="dashboard" element={<TellerDashboard />} />
        <Route path="customers" element={<EmployeeCustomers />} />
        <Route path="accounts" element={<EmployeeAccounts />} />
        <Route path="transactions" element={<EmployeeTransactions />} />
      </Route>
      
      {/* IT Routes */}
      <Route path="/it" element={
        <ITRoute>
          <EmployeeDashboard />
        </ITRoute>
      }>
        <Route index element={<Navigate to="/it/dashboard" />} />
        <Route path="dashboard" element={<ITDashboard />} />
      </Route>
      
      {/* Customer Service Routes */}
      <Route path="/customer-service" element={
        <CustomerServiceRoute>
          <EmployeeDashboard />
        </CustomerServiceRoute>
      }>
        <Route index element={<Navigate to="/customer-service/dashboard" />} />
        <Route path="dashboard" element={<CustomerServiceDashboard />} />
        <Route path="customers" element={<EmployeeCustomers />} />
      </Route>
      
      {/* HR Routes */}
      <Route path="/hr" element={
        <HRRoute>
          <EmployeeDashboard />
        </HRRoute>
      }>
        <Route index element={<Navigate to="/hr/dashboard" />} />
        <Route path="dashboard" element={<HRDashboard />} />
        <Route path="employees" element={<EmployeeEmployees />} />
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