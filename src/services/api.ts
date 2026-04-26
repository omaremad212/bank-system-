import axios from 'axios';

const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const login = {
  customer: async (nationalId: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE}/login/customer`, {
        nationalId,
        password,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.error || `Error: ${error.response.status}`);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
  
  employee: async (employeeId: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE}/login/employee`, {
        employeeId: parseInt(employeeId),
        password,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.error || `Error: ${error.response.status}`);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
};

export const customer = {
  getProfile: async () => {
    const response = await axios.get(`${API_BASE}/customer/profile`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getAccounts: async () => {
    const response = await axios.get(`${API_BASE}/customer/accounts`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getTransactions: async (accountId: number) => {
    const response = await axios.get(`${API_BASE}/customer/accounts/${accountId}/transactions`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  deposit: async (accountId: number, amount: number) => {
    const response = await axios.post(`${API_BASE}/customer/deposit`, {
      accountId,
      amount,
    }, { headers: getAuthHeaders() });
    return response.data;
  },
  
  withdraw: async (accountId: number, amount: number) => {
    const response = await axios.post(`${API_BASE}/customer/withdraw`, {
      accountId,
      amount,
    }, { headers: getAuthHeaders() });
    return response.data;
  },
  
  transfer: async (fromAccountId: number, toAccountId: number, amount: number) => {
    const response = await axios.post(`${API_BASE}/customer/transfer`, {
      fromAccountId,
      toAccountId,
      amount,
    }, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getLoans: async () => {
    const response = await axios.get(`${API_BASE}/customer/loans`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  createLoan: async (approvedAmt: number) => {
    const response = await axios.post(`${API_BASE}/customer/loans`, {
      amount: approvedAmt,
    }, { headers: getAuthHeaders() });
    return response.data;
  },
};

export const admin = {
  getCustomers: async () => {
    const response = await axios.get(`${API_BASE}/admin/customers`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  createCustomer: async (data: any) => {
    const response = await axios.post(`${API_BASE}/admin/customers`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  updateCustomer: async (id: number, data: any) => {
    const response = await axios.put(`${API_BASE}/admin/customers/${id}`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  deleteCustomer: async (id: number) => {
    const response = await axios.delete(`${API_BASE}/admin/customers/${id}`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getAccounts: async () => {
    const response = await axios.get(`${API_BASE}/admin/accounts`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  createAccount: async (data: any) => {
    const response = await axios.post(`${API_BASE}/admin/accounts`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  deleteAccount: async (id: number) => {
    const response = await axios.delete(`${API_BASE}/admin/accounts/${id}`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getEmployees: async () => {
    const response = await axios.get(`${API_BASE}/admin/employees`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  createEmployee: async (data: any) => {
    const response = await axios.post(`${API_BASE}/admin/employees`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  updateEmployee: async (id: number, data: any) => {
    const response = await axios.put(`${API_BASE}/admin/employees/${id}`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  deleteEmployee: async (id: number) => {
    const response = await axios.delete(`${API_BASE}/admin/employees/${id}`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getBranches: async () => {
    const response = await axios.get(`${API_BASE}/admin/branches`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  createBranch: async (data: any) => {
    const response = await axios.post(`${API_BASE}/admin/branches`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  updateBranch: async (id: number, data: any) => {
    const response = await axios.put(`${API_BASE}/admin/branches/${id}`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  deleteBranch: async (id: number) => {
    const response = await axios.delete(`${API_BASE}/admin/branches/${id}`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getDepartments: async () => {
    const response = await axios.get(`${API_BASE}/admin/departments`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  createDepartment: async (data: any) => {
    const response = await axios.post(`${API_BASE}/admin/departments`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getATMs: async () => {
    const response = await axios.get(`${API_BASE}/admin/atms`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  createATM: async (data: any) => {
    const response = await axios.post(`${API_BASE}/admin/atms`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getTransactions: async () => {
    const response = await axios.get(`${API_BASE}/admin/transactions`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  createTransaction: async (data: any) => {
    const response = await axios.post(`${API_BASE}/admin/transactions`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getLoans: async () => {
    const response = await axios.get(`${API_BASE}/admin/loans`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  updateLoan: async (id: number, data: any) => {
    const response = await axios.put(`${API_BASE}/admin/loans/${id}`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  createLoan: async (data: any) => {
    const response = await axios.post(`${API_BASE}/admin/loans`, data, { headers: getAuthHeaders() });
    return response.data;
  },
};

export default { login, customer, admin };