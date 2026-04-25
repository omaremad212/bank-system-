import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import CustomerLogin from './pages/CustomerLogin';
import EmployeeLogin from './pages/EmployeeLogin';
import CustomerDashboard from './pages/CustomerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import CustomerHome from './pages/customer/CustomerHome';
import CustomerAccounts from './pages/customer/CustomerAccounts';
import CustomerTransactions from './pages/customer/CustomerTransactions';
import CustomerLoans from './pages/customer/CustomerLoans';
import ManagerDashboard from './pages/employee/ManagerDashboard';
import ClerkDashboard from './pages/employee/ClerkDashboard';
import TellerDashboard from './pages/employee/TellerDashboard';
import EmployeeCustomers from './pages/employee/EmployeeCustomers';
import EmployeeAccounts from './pages/employee/EmployeeAccounts';
import EmployeeTransactions from './pages/employee/EmployeeTransactions';
import EmployeeLoans from './pages/employee/EmployeeLoans';
import EmployeeEmployees from './pages/employee/EmployeeEmployees';
import EmployeeBranches from './pages/employee/EmployeeBranches';
import EmployeeATMs from './pages/employee/EmployeeATMs';
import { useEffect } from 'react';

const ProtectedRoute = ({ children, allowedType }: { children: React.ReactNode; allowedType: 'customer' | 'employee' }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login/customer" />;
  }
  
  if (user.type !== allowedType) {
    return <Navigate to={user.type === 'customer' ? '/customer' : '/employee'} />;
  }
  
  return <>{children}</>;
};

const CustomerRoutes = () => {
  return (
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
  );
};

const RoleBasedEmployeeRoutes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user && user.type === 'employee') {
      const role = user.roleType;
      
      if (role === 'Manager' || role === 'Branch Manager') {
        navigate('/employee', { replace: true });
      } else if (role === 'Clerk') {
        navigate('/employee', { replace: true });
      } else if (role === 'Teller') {
        navigate('/employee', { replace: true });
      }
    }
  }, [user, navigate]);
  
  const role = user?.roleType;
  
  return (
    <Route path="/employee" element={
      <ProtectedRoute allowedType="employee">
        <EmployeeDashboard />
      </ProtectedRoute>
    }>
      <Route index element={
        role === 'Manager' || role === 'Branch Manager' ? <ManagerDashboard /> :
        role === 'Clerk' ? <ClerkDashboard /> :
        <TellerDashboard />
      } />
      <Route path="customers" element={role === 'Manager' ? <EmployeeCustomers /> : <Navigate to="/employee" />} />
      <Route path="accounts" element={<EmployeeAccounts />} />
      <Route path="transactions" element={<EmployeeTransactions />} />
      <Route path="loans" element={role === 'Manager' ? <EmployeeLoans /> : <Navigate to="/employee" />} />
      <Route path="employees" element={role === 'Manager' ? <EmployeeEmployees /> : <Navigate to="/employee" />} />
      <Route path="branches" element={role === 'Manager' ? <EmployeeBranches /> : <Navigate to="/employee" />} />
      <Route path="atms" element={role === 'Manager' ? <EmployeeATMs /> : <Navigate to="/employee" />} />
    </Route>
  );
};

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/login/customer" element={
        isAuthenticated && user?.type === 'customer' ? <Navigate to="/customer" /> :
        isAuthenticated && user?.type === 'employee' ? <Navigate to="/employee" /> :
        <CustomerLogin />
      } />
      <Route path="/login/employee" element={
        isAuthenticated && user?.type === 'employee' ? <Navigate to="/employee" /> :
        isAuthenticated && user?.type === 'customer' ? <Navigate to="/customer" /> :
        <EmployeeLogin />
      } />
      
      <CustomerRoutes />
      <RoleBasedEmployeeRoutes />
      
      <Route path="/" element={<Navigate to="/login/customer" />} />
      <Route path="*" element={<Navigate to="/login/customer" />} />
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