import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import CustomerLogin from './pages/CustomerLogin';
import EmployeeLogin from './pages/EmployeeLogin';
import CustomerDashboard from './pages/CustomerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import CustomerHome from './pages/customer/CustomerHome';
import CustomerAccounts from './pages/customer/CustomerAccounts';
import CustomerTransactions from './pages/customer/CustomerTransactions';
import CustomerLoans from './pages/customer/CustomerLoans';
import EmployeeHome from './pages/employee/EmployeeHome';
import EmployeeCustomers from './pages/employee/EmployeeCustomers';
import EmployeeAccounts from './pages/employee/EmployeeAccounts';
import EmployeeTransactions from './pages/employee/EmployeeTransactions';
import EmployeeLoans from './pages/employee/EmployeeLoans';
import EmployeeEmployees from './pages/employee/EmployeeEmployees';
import EmployeeBranches from './pages/employee/EmployeeBranches';
import EmployeeATMs from './pages/employee/EmployeeATMs';

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

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/login/customer" element={
        isAuthenticated ? <Navigate to={user?.type === 'customer' ? '/customer' : '/employee'} /> : <CustomerLogin />
      } />
      <Route path="/login/employee" element={
        isAuthenticated ? <Navigate to={user?.type === 'customer' ? '/customer' : '/employee'} /> : <EmployeeLogin />
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
      
      <Route path="/employee" element={
        <ProtectedRoute allowedType="employee">
          <EmployeeDashboard />
        </ProtectedRoute>
      }>
        <Route index element={<EmployeeHome />} />
        <Route path="customers" element={<EmployeeCustomers />} />
        <Route path="accounts" element={<EmployeeAccounts />} />
        <Route path="transactions" element={<EmployeeTransactions />} />
        <Route path="loans" element={<EmployeeLoans />} />
        <Route path="employees" element={<EmployeeEmployees />} />
        <Route path="branches" element={<EmployeeBranches />} />
        <Route path="atms" element={<EmployeeATMs />} />
      </Route>
      
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